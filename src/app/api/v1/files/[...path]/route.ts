import { NextRequest, NextResponse } from "next/server";
import { s3Client } from "@/lib/storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

const bucketName = process.env.S3_BUCKET_NAME || "alumni";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const key = resolvedParams.path.join("/");

    if (!key) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return new NextResponse("Not Found", { status: 404 });
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

    // Cache static assets in browser for 7 days
    headers.set("Cache-Control", "public, max-age=604800, immutable");

    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return new NextResponse("Not Found", { status: 404 });
    }
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
