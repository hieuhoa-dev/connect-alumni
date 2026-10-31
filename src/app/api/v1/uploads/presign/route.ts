import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import { getUploadPresignedUrl } from "@/lib/storage";
import { getUploadPolicy, MIME_TO_EXTENSION } from "@/lib/upload-policy";
import { db } from "@/db";
import { uploadedFiles } from "@/db/schema";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const current = await getCurrentUser();
    if (!current?.user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện tải tệp" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { contentType, size, purpose, relatedType, relatedId } = body;

    const policy = getUploadPolicy(purpose);
    if (!policy) {
      return NextResponse.json(
        { error: "Mục đích tải tệp (purpose) không hợp lệ." },
        { status: 400 }
      );
    }

    // Role check if policy specifies allowed roles
    if (
      policy.allowedRoles &&
      (!current.role || !policy.allowedRoles.includes(current.role))
    ) {
      return NextResponse.json(
        { error: "Bạn không có quyền tải tệp cho mục đích này." },
        { status: 403 }
      );
    }

    // Size check
    if (typeof size !== "number" || size <= 0 || size > policy.maxSizeBytes) {
      const maxMb = Math.round(policy.maxSizeBytes / (1024 * 1024));
      return NextResponse.json(
        { error: `Kích thước tệp vượt quá giới hạn tối đa (${maxMb}MB)` },
        { status: 400 }
      );
    }

    // MIME type check
    if (!contentType || !policy.allowedMimeTypes.includes(contentType)) {
      return NextResponse.json(
        {
          error: `Định dạng tệp không được hỗ trợ. Cho phép: ${policy.allowedMimeTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const ext = MIME_TO_EXTENSION[contentType] || "bin";
    const fileUuid = randomUUID();
    const key = `uploads/${purpose}/${fileUuid}.${ext}`;

    // Create entry in uploaded_files in 'pending' status
    const [fileRecord] = await db
      .insert(uploadedFiles)
      .values({
        id: fileUuid,
        ownerId: current.user.id,
        purpose,
        status: "pending",
        visibility: policy.visibility,
        relatedType: relatedType || null,
        relatedId: relatedId || null,
        fileKey: key,
        fileUrl: `/api/v1/files/${key}`,
        mimeType: contentType,
        sizeBytes: size,
      })
      .returning();

    const { uploadUrl } = await getUploadPresignedUrl({
      key,
      contentType,
      expiresInSeconds: 900,
    });

    return NextResponse.json({
      success: true,
      fileId: fileRecord.id,
      uploadUrl,
      key,
      fileUrl: fileRecord.fileUrl,
    });
  } catch (error: any) {
    console.error("Presign upload error:", error);
    return NextResponse.json(
      { error: "Không thể tạo liên kết tải tệp an toàn" },
      { status: 500 }
    );
  }
}
