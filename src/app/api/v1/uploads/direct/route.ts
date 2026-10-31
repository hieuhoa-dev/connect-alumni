import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import { uploadFile } from "@/lib/storage";
import { getUploadPolicy, MIME_TO_EXTENSION } from "@/lib/upload-policy";
import { db } from "@/db";
import { uploadedFiles } from "@/db/schema";
import { randomUUID } from "crypto";
import sharp from "sharp";

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
    const purpose = (formData.get("purpose") as string) || "avatar";

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy tệp đính kèm trong yêu cầu." },
        { status: 400 }
      );
    }

    const policy = getUploadPolicy(purpose);
    if (!policy) {
      return NextResponse.json(
        { error: "Mục đích tải tệp không hợp lệ." },
        { status: 400 }
      );
    }

    if (file.size > policy.maxSizeBytes) {
      const maxMb = Math.round(policy.maxSizeBytes / (1024 * 1024));
      return NextResponse.json(
        { error: `Kích thước tệp vượt quá giới hạn cho phép (${maxMb}MB).` },
        { status: 400 }
      );
    }

    if (!policy.allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Định dạng tệp không được hỗ trợ. Cho phép: ${policy.allowedMimeTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const ext = MIME_TO_EXTENSION[file.type] || "bin";
    const fileUuid = randomUUID();
    const key = `uploads/${purpose}/${fileUuid}.${ext}`;
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    let width: number | undefined;
    let height: number | undefined;
    const variants: Record<string, { key: string; url: string; width: number; height: number }> = {};

    if (file.type.startsWith("image/")) {
      const image = sharp(rawBuffer);
      const metadata = await image.metadata();
      width = metadata.width;
      height = metadata.height;

      if (policy.visibility === "public") {
        for (const config of [
          { name: "thumb", width: 400 },
          { name: "md", width: 960 },
          { name: "lg", width: 1600 },
        ] as const) {
          const processedBuffer = await sharp(rawBuffer)
            .resize({ width: config.width, withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();

          const vKey = `uploads/${purpose}/${fileUuid}-${config.name}.webp`;
          const { url } = await uploadFile({
            key: vKey,
            body: processedBuffer,
            contentType: "image/webp",
          });

          variants[config.name] = {
            key: vKey,
            url,
            width: config.width,
            height: 0,
          };
        }
      }
    }

    const { url: primaryUrl } = await uploadFile({
      key,
      body: rawBuffer,
      contentType: file.type,
    });

    const [record] = await db
      .insert(uploadedFiles)
      .values({
        id: fileUuid,
        ownerId: current.user.id,
        purpose,
        status: "ready",
        visibility: policy.visibility,
        fileKey: key,
        fileUrl: primaryUrl,
        mimeType: file.type,
        sizeBytes: file.size,
        width: width || null,
        height: height || null,
        variants: Object.keys(variants).length > 0 ? variants : null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      fileId: record.id,
      fileUrl: record.fileUrl,
      key,
      variants: record.variants,
    });
  } catch (error: any) {
    console.error("Direct upload error:", error);
    return NextResponse.json(
      { error: "Không thể xử lý và lưu trữ tệp tin." },
      { status: 500 }
    );
  }
}
