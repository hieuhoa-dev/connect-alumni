"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { profileRevisions, profiles, user, workExperiences } from "@/db/schema";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import {
  deleteWorkExperienceService,
  saveWorkExperienceService,
  updateProfileService,
  verifyAlumniProfileService,
} from "@/server/services/profile-service";
import type {
  ProfileUpdateInput,
  WorkExperienceInput,
} from "@/validators/profile-schema";

export const updateMyProfile = async (input: ProfileUpdateInput) => {
  const current = await getCurrentUser();
  if (!current?.user) {
    throw new Error("Chưa đăng nhập");
  }

  const result = await updateProfileService(
    {
      userId: current.user.id,
      role: current.role || "student",
      profileStatus: current.profile?.status || "active",
    },
    input,
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  revalidatePath("/profile");
  revalidatePath("/alumni");
  return result.data;
};

export const saveMyWorkExperience = async (input: WorkExperienceInput) => {
  const current = await getCurrentUser();
  if (!current?.user) {
    throw new Error("Chưa đăng nhập");
  }

  const result = await saveWorkExperienceService(
    {
      userId: current.user.id,
      role: current.role || "student",
      profileStatus: current.profile?.status || "active",
    },
    input,
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  revalidatePath("/profile");
  return result.data;
};

export const deleteMyWorkExperience = async (experienceId: string) => {
  const current = await getCurrentUser();
  if (!current?.user) {
    throw new Error("Chưa đăng nhập");
  }

  const result = await deleteWorkExperienceService(
    {
      userId: current.user.id,
      role: current.role || "student",
      profileStatus: current.profile?.status || "active",
    },
    experienceId,
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  revalidatePath("/profile");
  return result.data;
};

export const getMyWorkExperiences = async () => {
  const current = await getCurrentUser();
  if (!current?.user) {
    return [];
  }

  return await db.query.workExperiences.findMany({
    where: { userId: current.user.id },
    orderBy: { startDate: "desc" },
  });
};

export const getMyProfileRevisions = async () => {
  const current = await getCurrentUser();
  if (!current?.user) {
    return [];
  }

  return await db.query.profileRevisions.findMany({
    where: { userId: current.user.id },
    orderBy: { createdAt: "desc" },
    limit: 20,
  });
};

/**
 * Faculty Admin: Verify alumni profile
 */
export const verifyAlumni = async (input: {
  targetUserId: string;
  action: "approve" | "reject";
  reason?: string;
}) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  const result = await verifyAlumniProfileService(
    {
      userId: current.user.id,
      role: current.role,
      profileStatus: current.profile?.status || "active",
    },
    input,
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  revalidatePath("/faculty-admin/alumni-verification");
  revalidatePath("/alumni");
  return result.data;
};

/**
 * Faculty Admin: Get pending alumni verification queue
 */
export const getPendingAlumniVerifications = async () => {
  await requireRole(["faculty_staff", "admin"]);

  return await db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      fullName: profiles.fullName,
      studentCode: profiles.studentCode,
      faculty: profiles.faculty,
      batchYear: profiles.batchYear,
      graduationYear: profiles.graduationYear,
      phone: profiles.phone,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      currentTitle: profiles.currentTitle,
      currentCompanyName: profiles.currentCompanyName,
      createdAt: profiles.createdAt,
      alumniRejectedReason: profiles.alumniRejectedReason,
      email: user.email,
    })
    .from(profiles)
    .innerJoin(user, eq(profiles.userId, user.id))
    .where(and(eq(profiles.role, "alumni"), isNull(profiles.alumniVerifiedAt)))
    .orderBy(desc(profiles.createdAt));
};
