"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, roleEnum } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";

export interface SignUpProfileInput {
  email: string;
  password: string;
  name: string;
  role: (typeof roleEnum.enumValues)[number];
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
export const registerWithProfile = async (input: SignUpProfileInput) => {
  // 1. Create user via Better-Auth API
  const res = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: input.name,
    },
  });

  if (!res?.user?.id) {
    throw new Error(
      "Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.",
    );
  }

  // 2. Insert into profiles table
  const [newProfile] = await db
    .insert(profiles)
    .values({
      userId: res.user.id,
      role: input.role,
      fullName: input.name,
      studentCode: input.studentCode || null,
      faculty: input.faculty || "Công nghệ Thông tin",
      batchYear: input.batchYear || null,
      graduationYear: input.graduationYear || null,
      phone: input.phone || null,
      bio: input.bio || null,
      status: "active",
    })
    .returning();

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

  return userList;
};
