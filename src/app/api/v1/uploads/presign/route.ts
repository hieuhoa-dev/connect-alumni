import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import { getUploadPresignedUrl } from "@/lib/storage";
import { randomUUID } from "crypto";

const MAX_SIZES: Record<string, number> = {
  avatar: 2 * 1024 * 1024, // 2MB
  company_logo: 2 * 1024 * 1024, // 2MB
  event_cover: 5 * 1024 * 1024, // 5MB
  proof_document: 10 * 1024 * 1024, // 10MB
};

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  avatar: ["image/jpeg", "image/png", "image/webp"],
  company_logo: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  event_cover: ["image/jpeg", "image/png", "image/webp"],
  proof_document: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ],
};

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

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
    const { filename, contentType, size, purpose } = body;

    if (!purpose || !MAX_SIZES[purpose]) {
      return NextResponse.json(
        {
          error:
            "Mục đích tải tệp (purpose) không hợp lệ. Cho phép: avatar, company_logo, event_cover, proof_document",
        },
        { status: 400 }
      );
    }

    const maxSize = MAX_SIZES[purpose];
    if (typeof size !== "number" || size <= 0 || size > maxSize) {
      return NextResponse.json(
        {
          error: `Kích thước tệp vượt quá giới hạn tối đa (${Math.round(maxSize / (1024 * 1024))}MB)`,
        },
        { status: 400 }
      );
    }

    const allowedTypes = ALLOWED_MIME_TYPES[purpose];
    if (!contentType || !allowedTypes.includes(contentType)) {
      return NextResponse.json(
        {
          error: `Định dạng tệp không được hỗ trợ. Cho phép: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Generate random UUID key with mapped extension to prevent path traversal
    const ext = MIME_EXTENSIONS[contentType] || "bin";
    const secureKey = `uploads/${purpose}/${randomUUID()}.${ext}`;

    const { uploadUrl, key } = await getUploadPresignedUrl({
      key: secureKey,
      contentType,
      expiresInSeconds: 900, // 15 mins
    });

    const fileUrl = `/api/v1/files/${key}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      fileUrl,
      key,
    });
  } catch (error: any) {
    console.error("Presign upload error:", error);
    return NextResponse.json(
      { error: "Không thể tạo liên kết tải tệp an toàn" },
      { status: 500 }
    );
  }
}
