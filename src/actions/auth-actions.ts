"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { profiles, type roleEnum, session, user } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/rate-limiter";
import { type RegisterInput, registerSchema } from "@/validators/auth-schema";

export type SignUpProfileInput = RegisterInput;

/**
 * Register account and automatically create enriched profile
 */
export const registerWithProfile = async (input: SignUpProfileInput) => {
  // 1. Validate input strictly - role can only be student | alumni | employer
  const validated = registerSchema.parse(input);

  // Rate limit registration requests by IP or email
  const rateLimitResult = await checkRateLimit({
    key: `register:${validated.email.trim().toLowerCase()}`,
    limit: 5,
    windowSeconds: 300,
  });
  if (!rateLimitResult.success) {
    throw new Error(
      rateLimitResult.error ||
        "Bạn đã gửi quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau.",
    );
  }

  // 2. Check if email already exists
  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, validated.email.trim().toLowerCase()))
    .limit(1);
  if (existingUser) {
    throw new Error(
      "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.",
    );
  }

  // 3. Create user via Better-Auth API
  let res: Awaited<ReturnType<typeof auth.api.signUpEmail>> | null = null;
  try {
    res = await auth.api.signUpEmail({
      body: {
        email: validated.email,
        password: validated.password,
        name: validated.name,
      },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error?.message || "Không thể tạo tài khoản xác thực.");
  }

  if (!res?.user?.id) {
    throw new Error(
      "Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.",
    );
  }

  // 4. Insert into profiles — rollback user if profile insertion fails
  let newProfile: typeof profiles.$inferSelect | undefined;
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
  } catch (_profileError) {
    // Rollback: delete created user to prevent orphaned records
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
 * Task A6:
 * - Checks user exists
 * - Cannot self-lock
 * - Ensures >= 1 active admin remains
 * - Revokes all sessions immediately in same transaction (DELETE FROM session WHERE user_id = ?)
 */
export const adminToggleUserLock = async (
  targetUserId: string,
  lock: boolean,
) => {
  const current = await requireRole("admin");

  // Prevent self-lock
  if (targetUserId === current.user.id) {
    throw new Error("Bạn không thể tự khóa tài khoản của chính mình.");
  }

  const [targetProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, targetUserId))
    .limit(1);

  if (!targetProfile) {
    throw new Error("Không tìm thấy thông tin tài khoản người dùng.");
  }

  // If locking an admin, make sure at least 1 other active admin remains
  if (lock && targetProfile.role === "admin") {
    const [adminCountRes] = await db
      .select({ count: count() })
      .from(profiles)
      .where(
        and(
          eq(profiles.role, "admin"),
          eq(profiles.status, "active"),
          ne(profiles.userId, targetUserId),
        ),
      );

    if (Number(adminCountRes?.count || 0) < 1) {
      throw new Error(
        "Không thể khóa tài khoản quản trị viên duy nhất còn lại của hệ thống.",
      );
    }
  }

  // Execute lock and revoke sessions in transaction
  const updated = await db.transaction(async (tx) => {
    const [prof] = await tx
      .update(profiles)
      .set({
        status: lock ? "locked" : "active",
      })
      .where(eq(profiles.userId, targetUserId))
      .returning();

    if (lock) {
      await tx.delete(session).where(eq(session.userId, targetUserId));
    }

    return prof;
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: lock ? "lock_user_account" : "unlock_user_account",
    entityType: "user",
    entityId: targetUserId,
    metadata: {
      sessionsRevoked: lock,
    },
  });

  return updated;
};

/**
 * Admin: Update user role
 * Task A6:
 * - Cannot demote self if admin
 * - Ensures >= 1 active admin remains
 */
export const adminUpdateUserRole = async (
  targetUserId: string,
  newRole: (typeof roleEnum.enumValues)[number],
) => {
  const current = await requireRole("admin");

  if (targetUserId === current.user.id && newRole !== "admin") {
    throw new Error("Bạn không thể tự hạ quyền quản trị viên của chính mình.");
  }

  if (newRole !== "admin") {
    const [targetProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, targetUserId))
      .limit(1);

    if (targetProfile?.role === "admin") {
      const [adminCountRes] = await db
        .select({ count: count() })
        .from(profiles)
        .where(
          and(
            eq(profiles.role, "admin"),
            eq(profiles.status, "active"),
            ne(profiles.userId, targetUserId),
          ),
        );

      if (Number(adminCountRes?.count || 0) < 1) {
        throw new Error(
          "Hệ thống phải duy trì ít nhất 1 tài khoản quản trị viên đang hoạt động.",
        );
      }
    }
  }

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
    orderBy: (u, { desc }) => [desc(u.createdAt)],
  });

  return userList || [];
};

/**
 * Admin: Delete a user and cascade their profile
 */
export const adminDeleteUser = async (targetUserId: string) => {
  const current = await requireRole("admin");

  if (targetUserId === current.user.id) {
    throw new Error("Không thể tự xoá tài khoản đang đăng nhập");
  }

  const [adminCountRes] = await db
    .select({ count: count() })
    .from(profiles)
    .where(
      and(
        eq(profiles.role, "admin"),
        eq(profiles.status, "active"),
        ne(profiles.userId, targetUserId),
      ),
    );

  if (Number(adminCountRes?.count || 0) < 1) {
    throw new Error(
      "Không thể xóa quản trị viên duy nhất còn lại của hệ thống.",
    );
  }

  await db.transaction(async (tx) => {
    await tx.delete(session).where(eq(session.userId, targetUserId));
    await tx.delete(user).where(eq(user.id, targetUserId));
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: "delete_user_account",
    entityType: "user",
    entityId: targetUserId,
  });

  return { success: true };
};
