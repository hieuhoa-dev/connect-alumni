import Image from "next/image";
import { SITE } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface DluLogoProps {
  className?: string;
  alt?: string;
  preload?: boolean;
}

export const DluLogo = ({
  className,
  alt = SITE.logoAlt,
  preload = false,
}: DluLogoProps) => {
  return (
    <Image
      src={SITE.logoUrl}
      width={SITE.logoWidth}
      height={SITE.logoHeight}
      sizes="64px"
      alt={alt}
      preload={preload}
      className={cn("size-12 shrink-0 object-contain", className)}
    />
  );
};
