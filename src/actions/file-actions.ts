"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { formAnswers, formResponses, uploadedFiles } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/permissions";
import { getSignedFileUrl } from "@/lib/storage";

export interface GetPrivateFileUrlInput {
  key: string;
  applicationId?: string;
}

/**
 * Task A4: Generate short-lived signed URL (<= 5 minutes) for private files.
 * Authorizes only the file owner or faculty_staff/admin.
 * When faculty/admin views a scholarship file, logs audit event 'view_scholarship_file'.
 */
export const getPrivateFileDownloadUrl = async ({
  key,
  applicationId,
}: GetPrivateFileUrlInput): Promise<{ downloadUrl: string }> => {
  const current = await getCurrentUser();
  if (!current?.user) {
    throw new UnauthorizedError(
      "Vui lòng đăng nhập để truy cập tệp tài liệu này.",
    );
  }

  const userId = current.user.id;
  const isStaff = current.role === "faculty_staff" || current.role === "admin";

  if (!isStaff) {
    // Check ownership:
    // 1. Check in uploadedFiles table
    const [fileRecord] = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.fileKey, key))
      .limit(1);

    if (fileRecord && fileRecord.ownerId === userId) {
      // Owner confirmed
    } else {
      // 2. Check if file is part of user's form responses / scholarship applications
      const [answer] = await db
        .select({
          respondentId: formResponses.respondentId,
        })
        .from(formAnswers)
        .innerJoin(formResponses, eq(formAnswers.responseId, formResponses.id))
        .where(eq(formAnswers.fileUrl, `/api/v1/files/${key}`))
        .limit(1);

      if (!answer || answer.respondentId !== userId) {
        throw new ForbiddenError(
          "Bạn không có quyền xem hoặc tải về tệp riêng tư này.",
        );
      }
    }
  }

  // Generate signed URL with expiration <= 5 minutes (300 seconds)
  const downloadUrl = await getSignedFileUrl(key, 300);

  // If viewed by faculty/admin, log audit event
  if (isStaff) {
    await logAuditEvent({
      actorId: userId,
      action: "view_scholarship_file",
      entityType: "file",
      entityId: key,
      metadata: {
        applicationId: applicationId || null,
        fileKey: key,
        viewedAt: new Date().toISOString(),
      },
    });
  }

  return { downloadUrl };
};
