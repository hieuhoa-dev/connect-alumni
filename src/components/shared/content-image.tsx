"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { getPublicFileUrl, type UploadedFileDto } from "@/lib/file-url";

export interface ContentImageProps
  extends Omit<ImageProps, "src" | "alt" | "onError"> {
  file?: UploadedFileDto | string | null;
  alt: string;
  variant?: "thumb" | "md" | "lg";
  fallbackType?: "cover" | "avatar";
  className?: string;
}

export const ContentImage = ({
  file,
  alt,
  variant,
  fallbackType = "cover",
  className,
  ...props
}: ContentImageProps) => {
  const defaultFallback =
    fallbackType === "avatar"
      ? "/placeholder-avatar.svg"
      : "/placeholder-cover.svg";

  const initialSrc = file ? getPublicFileUrl(file, variant) : defaultFallback;
  const [imgSrc, setImgSrc] = React.useState<string>(initialSrc);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const nextSrc = file ? getPublicFileUrl(file, variant) : defaultFallback;
    setImgSrc(nextSrc);
    setHasError(false);
  }, [file, variant, defaultFallback]);

  return (
    <Image
      {...props}
      src={hasError ? defaultFallback : imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(defaultFallback);
        }
      }}
    />
  );
};
