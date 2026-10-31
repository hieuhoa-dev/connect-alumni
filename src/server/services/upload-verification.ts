import { db } from "@/db";
import { uploadedFiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { UploadPurpose } from "@/lib/upload-policy";

/**
 * Task B3: Security check preventing attaching files owned by another user,
 * mismatched purpose, or unready status.
 */
export async function verifyUploadedFile(
  fileId: string,
  ownerId: string,
  expectedPurpose: UploadPurpose,
): Promise<{ valid: boolean; error?: string; file?: any }> {
  const [file] = await db
    .select()
    .from(uploadedFiles)
    .where(
      and(
        eq(uploadedFiles.id, fileId),
        eq(uploadedFiles.ownerId, ownerId),
        eq(uploadedFiles.purpose, expectedPurpose),
        eq(uploadedFiles.status, "ready"),
      ),
    )
    .limit(1);

  if (!file) {
    return {
      valid: false,
      error: `Tệp ${fileId} không hợp lệ, không thuộc quyền sở hữu, sai mục đích (${expectedPurpose}) hoặc chưa ở trạng thái sẵn sàng.`,
    };
  }

  return { valid: true, file };
}
