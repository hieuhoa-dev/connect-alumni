import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import { uploadFile } from "@/lib/storage";
import { randomUUID } from "crypto";

const MAX_SIZES: Record<string, number> = {
  avatar: 2 * 1024 * 1024,
  company_logo: 2 * 1024 * 1024,
  event_cover: 5 * 1024 * 1024,
  proof_document: 10 * 1024 * 1024,
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const purpose = (formData.get("purpose") as string) || "event_cover";

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy tệp đính kèm trong yêu cầu." },
        { status: 400 }
      );
    }

    if (!MAX_SIZES[purpose]) {
      return NextResponse.json(
        { error: "Mục đích tải tệp không hợp lệ." },
        { status: 400 }
      );
    }

    const maxSize = MAX_SIZES[purpose];
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `Dung lượng tệp vượt quá giới hạn (${Math.round(maxSize / (1024 * 1024))}MB).`,
        },
        { status: 400 }
      );
    }

    const allowedTypes = ALLOWED_MIME_TYPES[purpose];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Định dạng tệp không được hỗ trợ. Cho phép: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const ext = MIME_EXTENSIONS[file.type] || "bin";
    const key = `uploads/${purpose}/${randomUUID()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadFile({
      key,
      body: buffer,
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      fileUrl: url,
      key,
    });
  } catch (error: any) {
    console.error("Direct upload error:", error);
    return NextResponse.json(
      { error: error.message || "Tải tệp lên máy chủ thất bại." },
      { status: 500 }
    );
  }
}
