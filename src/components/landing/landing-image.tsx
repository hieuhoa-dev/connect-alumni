"use client";

import { type ReactNode, useState } from "react";

export const LandingImage = ({
  src,
  alt,
  className,
  fallback,
}: {
  src: string | null;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || src === failedSrc) return fallback;

  return (
    // biome-ignore lint/performance/noImgElement: user-managed image domains are not fixed; native img supports an error fallback.
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
};
