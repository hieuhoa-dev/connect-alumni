export interface UploadedFileDto {
  id?: string;
  fileKey: string;
  fileUrl?: string | null;
  variants?: Record<
    string,
    { key: string; url?: string; width?: number; height?: number }
  > | null;
  visibility?: string | null;
}

/**
 * Returns the public URL for a given uploaded file or key and optional variant (thumb, md, lg).
 */
export function getPublicFileUrl(
  fileOrKey: UploadedFileDto | string | null | undefined,
  variant?: "thumb" | "md" | "lg",
): string {
  if (!fileOrKey) {
    return "/placeholder-cover.svg";
  }

  const publicBaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL || process.env.S3_PUBLIC_BASE_URL;

  let key: string;
  if (typeof fileOrKey === "string") {
    key = fileOrKey;
  } else {
    if (variant && fileOrKey.variants && fileOrKey.variants[variant]?.key) {
      key = fileOrKey.variants[variant].key;
    } else {
      key = fileOrKey.fileKey;
    }
  }

  // If already full URL or root relative path
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  if (key.startsWith("/")) {
    return key;
  }

  if (publicBaseUrl) {
    const cleanBase = publicBaseUrl.replace(/\/+$/, "");
    return `${cleanBase}/${key}`;
  }

  return `/api/v1/files/${key}`;
}
