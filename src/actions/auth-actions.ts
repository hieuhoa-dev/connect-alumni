"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, user, roleEnum } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";
import { registerSchema, RegisterInput } from "@/validators/auth-schema";

export type SignUpProfileInput = RegisterInput;

/**
 * Register account and automatically create enriched profile
 */
export const registerWithProfile = async (input: SignUpProfileInput) => {
  // 1. Validate input strictly - role can only be student | alumni | employer
  const validated = registerSchema.parse(input);

  // 2. Check if email already exists
  const existingUser = await db.query.user.findFirst({
    where: {
      email: validated.email.trim().toLowerCase(),
    },
  });
  if (existingUser) {
    throw new Error("Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.");
  }

  // 3. Create user via Better-Auth API
  let res;
  try {
    res = await auth.api.signUpEmail({
      body: {
        email: validated.email,
        password: validated.password,
        name: validated.name,
      },
    });
  } catch (err: any) {
    throw new Error(err.message || "Không thể tạo tài khoản xác thực.");
  }

  if (!res?.user?.id) {
    throw new Error(
      "Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.",
    );
  }

  // 4. Insert vào bảng profiles — nếu thất bại phải xoá user vừa tạo để tránh orphaned account
  let newProfile;
  try {
    const [inserted] = await db
      .insert(profiles)
      .values({
        userId: res.user.id,
        role: validated.role,
        fullName: validated.name,
        studentCode: validated.studentCode || null,
        faculty: validated.faculty || "Công nghệ Thông tin",
        batchYear: validated.batchYear || null,
        graduationYear: validated.graduationYear || null,
        phone: validated.phone || null,
        bio: validated.bio || null,
        status: "active",
      })
      .returning();
    newProfile = inserted;
  } catch (profileError) {
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
    throw new Error(
      "Không thể khởi tạo hồ sơ người dùng. Vui lòng thử lại hoặc liên hệ quản trị viên.",
    );
  }

  await logAuditEvent({
    actorId: res.user.id,
    action: "register_account",
    entityType: "user",
    entityId: res.user.id,
    metadata: { role: input.role, email: input.email },
  });

  return { user: res.user, profile: newProfile };
};

/**
 * Update current user profile
 */
export const updateCurrentUserProfile = async (data: {
  fullName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  studentCode?: string;
  faculty?: string;
  batchYear?: number;
  graduationYear?: number;
}) => {
  const current = await getCurrentUser();
  if (!current?.user) {
    throw new Error("Chưa đăng nhập");
  }

  const [updated] = await db
    .update(profiles)
    .set({
      fullName: data.fullName ?? current.profile?.fullName,
      phone: data.phone ?? current.profile?.phone,
      bio: data.bio ?? current.profile?.bio,
      avatarUrl: data.avatarUrl ?? current.profile?.avatarUrl,
      studentCode: data.studentCode ?? current.profile?.studentCode,
      faculty: data.faculty ?? current.profile?.faculty,
      batchYear: data.batchYear ?? current.profile?.batchYear,
      graduationYear: data.graduationYear ?? current.profile?.graduationYear,
    })
    .where(eq(profiles.userId, current.user.id))
    .returning();

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

  const [updated] = await db
    .update(profiles)
    .set({
      status: lock ? "locked" : "active",
    })
    .where(eq(profiles.userId, targetUserId))
    .returning();

  await logAuditEvent({
    actorId: current.user.id,
    action: lock ? "lock_user_account" : "unlock_user_account",
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

  const [updated] = await db
    .update(profiles)
    .set({ role: newRole })
    .where(eq(profiles.userId, targetUserId))
    .returning();

  await logAuditEvent({
    actorId: current.user.id,
    action: "change_user_role",
    entityType: "user",
    entityId: targetUserId,
    metadata: { newRole },
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

  return userList || [];
};
