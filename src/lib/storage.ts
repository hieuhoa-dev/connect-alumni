import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const region = process.env.AWS_REGION || "us-east-2";
const bucketName = process.env.S3_BUCKET_NAME || "connect-alumni";

export const s3Client = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

/**
 * Upload a file directly to Object Storage
 */
export const uploadFile = async ({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}): Promise<{ key: string; url: string }> => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return key and fallback public/direct URL
  const url = endpoint
    ? `${endpoint}/${bucketName}/${key}`
    : `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return { key, url };
};

/**
 * Generate a pre-signed URL for secure temporary download/viewing
 */
export const getSignedFileUrl = async (
  key: string,
  expiresInSeconds = 3600,
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    return await awsGetSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  } catch (error) {
    console.warn("Failed to generate signed URL, returning fallback key URL", error);
    return endpoint
      ? `${endpoint}/${bucketName}/${key}`
      : `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  }
};

/**
 * Generate pre-signed URL for direct client-side upload
 */
export const getUploadPresignedUrl = async ({
  key,
  contentType,
  expiresInSeconds = 900,
}: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<{ uploadUrl: string; key: string }> => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await awsGetSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  return { uploadUrl, key };
};

/**
 * Delete a file by key
 */
export const deleteFile = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
};
