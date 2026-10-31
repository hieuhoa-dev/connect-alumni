import { NextRequest, NextResponse } from "next/server";
import { s3Client } from "@/lib/storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

const bucketName = process.env.S3_BUCKET_NAME || "alumni";

const ALLOWED_PUBLIC_PREFIXES = [
  "uploads/avatar/",
  "uploads/company_logo/",
  "uploads/event_cover/",
  "uploads/experience_cover/",
  "uploads/hero_banner/",
  "uploads/album_photo/",
];

function isPublicFile(key: string): boolean {
  if (key.includes("..") || key.includes("//")) return false;
  return ALLOWED_PUBLIC_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const resolvedParams = await params;
    const key = resolvedParams.path.join("/");

    if (!key) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    // Task A4: Private files are strictly prohibited through this route.
    if (!isPublicFile(key)) {
      return new NextResponse(
        "Forbidden: Tệp này thuộc diện riêng tư và không thể truy cập công khai.",
        {
          status: 403,
          headers: {
            "Cache-Control": "private, no-store",
            "Content-Type": "text/plain; charset=utf-8",
          },
        },
      );
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: { "Cache-Control": "public, max-age=60" },
      });
    }

    // Convert AWS SDK stream to Web ReadableStream
    const stream = response.Body.transformToWebStream();

    const headers = new Headers();
    if (response.ContentType) {
      headers.set("Content-Type", response.ContentType);
    }
    if (response.ContentLength) {
      headers.set("Content-Length", String(response.ContentLength));
    }
    if (response.ETag) {
      headers.set("ETag", response.ETag);
    }

    // Cache static public assets in browser for 7 days
    headers.set("Cache-Control", "public, max-age=604800, immutable");

    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: { "Cache-Control": "private, no-store" },
      });
    }
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
