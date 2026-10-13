"use server";

import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { profiles, roleEnum, session, user } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { auth, type Session } from "@/lib/auth";
import {
  ForbiddenError,
  requireActiveUser,
  requireRole,
} from "@/lib/permissions";
import {
  type ProfileUpdateInput,
  profileUpdateSchema,
} from "@/validators/profile-schema";

/**
 * Chỉ các vai trò này được tự đăng ký. faculty_staff và admin
 * chỉ được cấp bởi quản trị viên (adminUpdateUserRole) hoặc seed.
 */
const SELF_REGISTER_ROLES = ["student", "alumni", "employer"] as const;

const registrationSchema = z
  .object({
    email: z.string().trim().email("Email không hợp lệ").max(254),
    password: z.string().min(8, "Mật khẩu ít nhất 8 ký tự").max(128),
    name: profileUpdateSchema.shape.fullName,
    role: z.enum(SELF_REGISTER_ROLES, {
      error: "Vai trò đăng ký không hợp lệ",
    }),
    studentCode: profileUpdateSchema.shape.studentCode,
    faculty: profileUpdateSchema.shape.faculty,
    batchYear: z
      .number()
      .int()
      .min(1958)
      .max(new Date().getFullYear() + 6)
      .optional(),
    graduationYear: z
      .number()
      .int()
      .min(1958)
      .max(new Date().getFullYear() + 6)
      .optional(),
    phone: profileUpdateSchema.shape.phone,
    bio: profileUpdateSchema.shape.bio,
  })
  .superRefine((data, ctx) => {
    if (data.role === "student" && !data.studentCode) {
      ctx.addIssue({
        code: "custom",
        path: ["studentCode"],
        message: "Vui lòng nhập mã sinh viên",
      });
    }
    if (data.role === "student" && !data.batchYear) {
      ctx.addIssue({
        code: "custom",
        path: ["batchYear"],
        message: "Vui lòng nhập năm nhập học",
      });
    }
    if (
      data.batchYear &&
      data.graduationYear &&
      data.graduationYear < data.batchYear
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["graduationYear"],
        message: "Năm tốt nghiệp không thể trước năm nhập học",
      });
    }
  });

export interface SignUpProfileInput {
  email: string;
  password: string;
  name: string;
  role: (typeof SELF_REGISTER_ROLES)[number];
  studentCode?: string;
  faculty?: string;
  batchYear?: number;
  graduationYear?: number;
  phone?: string;
  bio?: string;
}

/**
 * Register account and automatically create enriched profile
 */
export const registerWithProfile = async (
  input: SignUpProfileInput,
): Promise<
  | { error: string }
  | { user: Session["user"]; profile: typeof profiles.$inferSelect }
> => {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Thông tin đăng ký không hợp lệ",
    };
  }
  const data = parsed.data;

  // 1. Create user via Better-Auth API
  const res = await auth.api
    .signUpEmail({
      headers: await headers(),
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    })
    .catch((error: unknown) => {
      if (
        error instanceof APIError &&
        error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      ) {
        return {
          error:
            "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.",
        };
      }
      console.error("Could not register account", error);
      return {
        error: "Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.",
      };
    });

  if ("error" in res) {
    return {
      error:
        res.error ?? "Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.",
    };
  }

  if (!res?.user?.id) {
    return {
      error: "Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.",
    };
  }

  // 2. Insert vào bảng profiles — nếu thất bại phải xoá user vừa tạo để tránh orphaned account
  let newProfile: typeof profiles.$inferSelect;
  try {
    const [inserted] = await db
      .insert(profiles)
      .values({
        userId: res.user.id,
        role: data.role,
        fullName: data.name,
        studentCode: data.role === "employer" ? null : data.studentCode,
        faculty: data.role === "employer" ? null : (data.faculty ?? null),
        batchYear: data.role === "employer" ? null : (data.batchYear ?? null),
        graduationYear:
          data.role === "employer" ? null : (data.graduationYear ?? null),
        phone: data.phone,
        bio: data.bio,
        status: "active",
      })
      .returning();
    newProfile = inserted;
  } catch {
    // Rollback: xoá user vừa tạo khỏi DB để tránh trạng thái broken
    try {
      await db.delete(user).where(eq(user.id, res.user.id));
    } catch (cleanupError) {
      console.error(
        "Critical: Không thể dọn dẹp user mồ côi sau lỗi tạo profile. UserID:",
        res.user.id,
        cleanupError,
      );
    }
    // Signup already issued a cookie. Expire it without revoking a session
    // that may have been present on the incoming registration request.
    try {
      await auth.api.signOut({ headers: new Headers() });
    } catch (cookieError) {
      console.error("Could not clear failed registration cookie", cookieError);
    }
    return {
      error:
        "Không thể khởi tạo hồ sơ người dùng. Vui lòng thử lại hoặc liên hệ quản trị viên.",
    };
  }

  await logAuditEvent({
    actorId: res.user.id,
    action: "register_account",
    entityType: "user",
    entityId: res.user.id,
    metadata: { role: data.role, email: res.user.email },
  });

  return { user: res.user, profile: newProfile };
};

/**
 * Cập nhật hồ sơ của chính mình.
 * Chỉ nhận các trường được phép sửa: role, status, userId không thể đổi qua đây.
 * Chuỗi rỗng nghĩa là xóa giá trị (trừ họ tên, bắt buộc).
 */
export const updateCurrentUserProfile = async (input: ProfileUpdateInput) => {
  const current = await requireActiveUser();
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Thông tin hồ sơ không hợp lệ",
    };
  }
  const data = parsed.data;

  const showStudentFields =
    current.role === "student" || current.role === "alumni";
  const updated = await db.transaction(async (tx) => {
    const [profile] = await tx
      .update(profiles)
      .set({
        fullName: data.fullName,
        phone: data.phone,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        ...(showStudentFields
          ? {
              studentCode: data.studentCode,
              faculty: data.faculty,
              batchYear: data.batchYear,
              graduationYear: data.graduationYear,
            }
          : {}),
      })
      .where(eq(profiles.userId, current.user.id))
      .returning();

    if (!profile) {
      throw new Error("Không tìm thấy hồ sơ. Vui lòng liên hệ quản trị viên.");
    }
    await tx
      .update(user)
      .set({ name: data.fullName, image: data.avatarUrl })
      .where(eq(user.id, current.user.id));
    return profile;
  });

  revalidatePath("/", "layout");

  return updated;
};

/**
 * Admin: Lock or unlock an account
 */
export const adminToggleUserLock = async (
  targetUserId: string,
  lock: boolean,
) => {
  const current = await requireRole("admin");
  const validatedUserId = z.string().min(1).parse(targetUserId);
  const shouldLock = z.boolean().parse(lock);
  if (shouldLock && validatedUserId === current.user.id) {
    throw new ForbiddenError("Không thể tự khóa tài khoản của chính mình");
  }
  const updated = await db.transaction(async (tx) => {
    const [profile] = await tx
      .update(profiles)
      .set({ status: shouldLock ? "locked" : "active" })
      .where(eq(profiles.userId, validatedUserId))
      .returning();
    if (!profile) throw new Error("Không tìm thấy người dùng");
    if (shouldLock) {
      await tx.delete(session).where(eq(session.userId, validatedUserId));
    }
    return profile;
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: shouldLock ? "lock_user_account" : "unlock_user_account",
    entityType: "user",
    entityId: targetUserId,
  });

  return updated;
};

/**
 * Admin: Update user role
 */
export const adminUpdateUserRole = async (
  targetUserId: string,
  newRole: (typeof roleEnum.enumValues)[number],
) => {
  const current = await requireRole("admin");
  const validatedUserId = z.string().min(1).parse(targetUserId);
  const validatedRole = z.enum(roleEnum.enumValues).parse(newRole);
  if (validatedUserId === current.user.id) {
    throw new ForbiddenError("Không thể tự thay đổi vai trò của chính mình");
  }

  const [updated] = await db
    .update(profiles)
    .set({ role: validatedRole })
    .where(eq(profiles.userId, validatedUserId))
    .returning();

  if (!updated) throw new Error("Không tìm thấy người dùng");

  await logAuditEvent({
    actorId: current.user.id,
    action: "change_user_role",
    entityType: "user",
    entityId: targetUserId,
    metadata: { newRole: validatedRole },
  });

  return updated;
};

/**
 * Admin: Get all users with profiles
 */
export const adminGetUsers = async () => {
  await requireRole("admin");

  const userList = await db.query.user.findMany({
    with: {
      profile: true,
      companyMemberships: {
        with: {
          company: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return userList;
};
