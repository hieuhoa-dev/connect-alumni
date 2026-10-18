import { db } from "@/db";
import { profiles, workExperiences, profileRevisions, user, companies } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";
import { Result, ok, fail } from "@/lib/result";
import {
  profileUpdateSchema,
  workExperienceSchema,
  alumniVerifySchema,
} from "@/validators/profile-schema";

export interface ActorContext {
  userId: string;
  role: string;
  profileStatus: string;
}

/**
 * Service: Update user's own profile
 * Enforces:
 * - Cannot change studentCode, batchYear, graduationYear if already verified by faculty (unless faculty/admin)
 * - Records revision history in profile_revisions
 */
export const updateProfileService = async (
  actor: ActorContext,
  input: any,
): Promise<Result<any>> => {
  if (actor.profileStatus === "locked") {
    return fail("FORBIDDEN", "Tài khoản của bạn đã bị khóa.");
  }

  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
  }

  const data = parsed.data;

  // Retrieve current profile
  const existing = await db.query.profiles.findFirst({
    where: { userId: actor.userId },
  });

  if (!existing) {
    return fail("NOT_FOUND", "Không tìm thấy hồ sơ.");
  }

  // If already verified as alumni, studentCode/batchYear/graduationYear are locked for the user
  const isAlumniVerified = !!existing.alumniVerifiedAt;
  const isFacultyOrAdmin = actor.role === "faculty_staff" || actor.role === "admin";

  if (isAlumniVerified && !isFacultyOrAdmin) {
    if (
      data.studentCode !== undefined &&
      data.studentCode !== existing.studentCode
    ) {
      return fail("FORBIDDEN", "Mã số sinh viên đã được Khoa xác thực, không thể tự chỉnh sửa.");
    }
    if (
      data.batchYear !== undefined &&
      data.batchYear !== existing.batchYear
    ) {
      return fail("FORBIDDEN", "Khóa tuyển sinh đã được Khoa xác thực, không thể tự chỉnh sửa.");
    }
    if (
      data.graduationYear !== undefined &&
      data.graduationYear !== existing.graduationYear
    ) {
      return fail("FORBIDDEN", "Năm tốt nghiệp đã được Khoa xác thực, không thể tự chỉnh sửa.");
    }
  }

  // Collect diffs for profile_revisions
  const changes: Record<string, { from: any; to: any }> = {};
  const fieldsToCheck = [
    "fullName",
    "phone",
    "bio",
    "avatarUrl",
    "studentCode",
    "faculty",
    "major",
    "province",
    "batchYear",
    "graduationYear",
    "employmentStatus",
    "currentTitle",
    "currentCompanyName",
    "industry",
    "linkedinUrl",
    "githubUrl",
    "websiteUrl",
    "skills",
    "visibility",
    "showEmail",
    "showPhone",
    "emailNotifications",
  ] as const;

  for (const field of fieldsToCheck) {
    if (data[field] !== undefined && (data as any)[field] !== (existing as any)[field]) {
      changes[field] = {
        from: (existing as any)[field] ?? null,
        to: (data as any)[field] ?? null,
      };
    }
  }

  return await db.transaction(async (tx) => {
    // If currentCompanyName was provided, check if company exists in verified companies
    let linkedCompanyId = data.currentCompanyId ?? existing.currentCompanyId;
    if (data.currentCompanyName && !linkedCompanyId) {
      const matchComp = await tx.query.companies.findFirst({
        where: {
          name: data.currentCompanyName.trim(),
          verificationStatus: "verified",
        },
      });
      if (matchComp) {
        linkedCompanyId = matchComp.id;
      }
    }

    const updatePayload: any = {
      ...data,
      currentCompanyId: linkedCompanyId,
      lastConfirmedAt: new Date(),
    };

    // Strip undefined
    Object.keys(updatePayload).forEach((k) => {
      if (updatePayload[k] === undefined) {
        delete updatePayload[k];
      }
    });

    const [updated] = await tx
      .update(profiles)
      .set(updatePayload)
      .where(eq(profiles.userId, actor.userId))
      .returning();

    // Log revision if changes occurred
    if (Object.keys(changes).length > 0) {
      await tx.insert(profileRevisions).values({
        userId: actor.userId,
        changedBy: actor.userId,
        changes,
        source: "self",
      });
    }

    await logAuditEvent({
      actorId: actor.userId,
      action: "update_profile",
      entityType: "profile",
      entityId: updated.id,
      metadata: { fieldsChanged: Object.keys(changes) },
    });

    return ok(updated);
  });
};

/**
 * Service: Faculty admin verify or reject alumni profile
 */
export const verifyAlumniProfileService = async (
  actor: ActorContext,
  input: any,
): Promise<Result<any>> => {
  if (actor.role !== "faculty_staff" && actor.role !== "admin") {
    return fail("FORBIDDEN", "Bạn không có quyền xác thực cựu sinh viên.");
  }

  const parsed = alumniVerifySchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
  }

  const { targetUserId, action, reason } = parsed.data;

  const targetProfile = await db.query.profiles.findFirst({
    where: { userId: targetUserId },
  });

  if (!targetProfile) {
    return fail("NOT_FOUND", "Không tìm thấy hồ sơ cựu sinh viên.");
  }

  if (targetProfile.role !== "alumni") {
    return fail("VALIDATION_ERROR", "Người dùng này không thuộc vai trò Cựu sinh viên.");
  }

  if (action === "approve") {
    const [updated] = await db
      .update(profiles)
      .set({
        alumniVerifiedAt: new Date(),
        alumniVerifiedBy: actor.userId,
        alumniRejectedReason: null,
      })
      .where(eq(profiles.userId, targetUserId))
      .returning();

    await logAuditEvent({
      actorId: actor.userId,
      action: "verify_alumni_profile",
      entityType: "profile",
      entityId: updated.id,
      metadata: { targetUserId },
    });

    await sendNotification({
      userId: targetUserId,
      type: "alumni_verified",
      title: "Hồ sơ cựu sinh viên đã được xác thực 🎉",
      body: "Chúc mừng! Khoa CNTT - ĐH Đà Lạt đã xác thực hồ sơ cựu sinh viên của bạn. Bạn đã có thể xuất hiện trên Danh bạ và tham gia toàn bộ mạng lưới kết nối.",
      linkUrl: "/profile",
    });

    return ok(updated);
  } else {
    // Reject
    if (!reason || reason.trim().length < 5) {
      return fail("Vui lòng nhập lý do từ chối (tối thiểu 5 ký tự).", "VALIDATION_ERROR");
    }

    const [updated] = await db
      .update(profiles)
      .set({
        alumniVerifiedAt: null,
        alumniVerifiedBy: actor.userId,
        alumniRejectedReason: reason.trim(),
      })
      .where(eq(profiles.userId, targetUserId))
      .returning();

    await logAuditEvent({
      actorId: actor.userId,
      action: "reject_alumni_profile",
      entityType: "profile",
      entityId: updated.id,
      metadata: { targetUserId, reason },
    });

    await sendNotification({
      userId: targetUserId,
      type: "alumni_rejected",
      title: "Yêu cầu xác thực cựu sinh viên chưa được duyệt",
      body: `Hồ sơ cựu sinh viên của bạn chưa được duyệt vì lý do: ${reason}. Vui lòng cập nhật lại thông tin.`,
      linkUrl: "/profile",
    });

    return ok(updated);
  }
};

/**
 * Service: Add or update work experience
 */
export const saveWorkExperienceService = async (
  actor: ActorContext,
  input: any,
): Promise<Result<any>> => {
  if (actor.profileStatus === "locked") {
    return fail("FORBIDDEN", "Tài khoản của bạn đã bị khóa.");
  }

  const parsed = workExperienceSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
  }

  const data = parsed.data;

  return await db.transaction(async (tx) => {
    // If isCurrent is true, reset any other current experiences for this user
    if (data.isCurrent) {
      await tx
        .update(workExperiences)
        .set({ isCurrent: false })
        .where(eq(workExperiences.userId, actor.userId));
    }

    let savedExp;
    if (data.id) {
      const [updated] = await tx
        .update(workExperiences)
        .set({
          companyName: data.companyName,
          companyId: data.companyId ?? null,
          title: data.title,
          industry: data.industry ?? null,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          isCurrent: data.isCurrent,
          description: data.description ?? null,
        })
        .where(
          and(
            eq(workExperiences.id, data.id),
            eq(workExperiences.userId, actor.userId),
          ),
        )
        .returning();
      savedExp = updated;
    } else {
      const [created] = await tx
        .insert(workExperiences)
        .values({
          userId: actor.userId,
          companyName: data.companyName,
          companyId: data.companyId ?? null,
          title: data.title,
          industry: data.industry ?? null,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          isCurrent: data.isCurrent,
          description: data.description ?? null,
        })
        .returning();
      savedExp = created;
    }

    // If isCurrent, sync into profiles.currentTitle and currentCompanyName
    if (data.isCurrent) {
      await tx
        .update(profiles)
        .set({
          currentTitle: data.title,
          currentCompanyName: data.companyName,
          currentCompanyId: data.companyId ?? null,
          industry: data.industry ?? undefined,
        })
        .where(eq(profiles.userId, actor.userId));
    }

    return ok(savedExp);
  });
};

/**
 * Service: Delete work experience
 */
export const deleteWorkExperienceService = async (
  actor: ActorContext,
  experienceId: string,
): Promise<Result<boolean>> => {
  if (actor.profileStatus === "locked") {
    return fail("FORBIDDEN", "Tài khoản của bạn đã bị khóa.");
  }

  const [deleted] = await db
    .delete(workExperiences)
    .where(
      and(
        eq(workExperiences.id, experienceId),
        eq(workExperiences.userId, actor.userId),
      ),
    )
    .returning();

  if (!deleted) {
    return fail("NOT_FOUND", "Không tìm thấy kinh nghiệm làm việc để xóa.");
  }

  return ok(true);
};
