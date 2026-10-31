import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import { db } from "@/db";
import { uploadedFiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getObjectBuffer, headObject, uploadFile, deleteFile } from "@/lib/storage";
import { getUploadPolicy } from "@/lib/upload-policy";
import sharp, { type Metadata } from "sharp";

export async function POST(req: NextRequest) {
  try {
    const current = await getCurrentUser();
    if (!current?.user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xác nhận tải tệp." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { fileId, key } = body;

    if (!fileId || !key) {
      return NextResponse.json(
        { error: "Thiếu thông tin fileId hoặc key." },
        { status: 400 },
      );
    }

    // Find record in uploadedFiles
    const [fileRecord] = await db
      .select()
      .from(uploadedFiles)
      .where(
        and(
          eq(uploadedFiles.id, fileId),
          eq(uploadedFiles.ownerId, current.user.id),
        ),
      )
      .limit(1);

    if (!fileRecord) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin bản ghi tải tệp." },
        { status: 404 },
      );
    }

    const purpose = fileRecord.purpose || "avatar";
    const policy = getUploadPolicy(purpose);
    const isImage = fileRecord.mimeType.startsWith("image/");

    let width: number | undefined;
    let height: number | undefined;
    const variants: Record<string, { key: string; url: string; width: number; height: number }> = {};

    if (isImage) {
      // 1. Fetch object from S3
      let buffer: Buffer;
      try {
        buffer = await getObjectBuffer(key);
      } catch (err) {
        return NextResponse.json(
          { error: "Không thể đọc dữ liệu tệp từ kho lưu trữ. Vui lòng thử tải lại." },
          { status: 400 },
        );
      }

      // 2. Validate with sharp (prevents renamed non-image files)
      let metadata: Metadata;
      try {
        const image = sharp(buffer);
        metadata = await image.metadata();
        if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
          throw new Error("Invalid format");
        }
      } catch (_err) {
        // Corrupted or not an actual image
        await deleteFile(key).catch(() => {});
        await db.delete(uploadedFiles).where(eq(uploadedFiles.id, fileId));
        return NextResponse.json(
          { error: "Tệp tải lên không phải là ảnh hợp lệ hoặc đã bị lỗi định dạng." },
          { status: 400 },
        );
      }

      width = metadata.width;
      height = metadata.height;

      // 3. For public images: strip EXIF/GPS metadata and generate WebP variants
      if (fileRecord.visibility === "public") {
        const variantConfigs = [
          { name: "thumb", width: 400 },
          { name: "md", width: 960 },
          { name: "lg", width: 1600 },
        ] as const;

        for (const config of variantConfigs) {
          // Sharp by default strips all EXIF and GPS tags unless .withMetadata() is explicitly called
          const processedBuffer = await sharp(buffer)
            .resize({
              width: config.width,
              withoutEnlargement: true,
            })
            .webp({ quality: 85 })
            .toBuffer();

          const processedMeta = await sharp(processedBuffer).metadata();
          const variantKey = `uploads/${purpose}/${fileId}-${config.name}.webp`;

          const { url } = await uploadFile({
            key: variantKey,
            body: processedBuffer,
            contentType: "image/webp",
          });

          variants[config.name] = {
            key: variantKey,
            url,
            width: processedMeta.width || config.width,
            height: processedMeta.height || 0,
          };
        }
      }
    } else {
      // Document file (PDF, etc.)
      const head = await headObject(key);
      if (!head) {
        return NextResponse.json(
          { error: "Không tìm thấy tệp tài liệu trong kho lưu trữ." },
          { status: 400 },
        );
      }
    }

    // Update status to 'ready'
    const [updated] = await db
      .update(uploadedFiles)
      .set({
        status: "ready",
        width: width || null,
        height: height || null,
        variants: Object.keys(variants).length > 0 ? variants : null,
      })
      .where(eq(uploadedFiles.id, fileId))
      .returning();

    return NextResponse.json({
      success: true,
      fileId: updated.id,
      fileUrl: updated.fileUrl,
      variants: updated.variants,
    });
  } catch (error: any) {
    console.error("Confirm upload error:", error);
    return NextResponse.json(
      { error: "Không thể xác nhận xử lý tệp." },
      { status: 500 },
    );
  }
}
