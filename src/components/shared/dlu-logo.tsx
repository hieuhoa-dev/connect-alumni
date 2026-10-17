import * as React from "react";
import Image from "next/image";

interface DLULogoProps {
  className?: string;
  size?: number;
}

export const DLULogo = ({ className = "", size = 42 }: DLULogoProps) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-white p-0.5 ring-1 ring-[#1E4D2B]/20 shadow-xs transition-all duration-200 hover:ring-[#1E4D2B]/40 hover:scale-105 hover:shadow-sm ${className}`}
      style={{ width: size, height: size }}
      title="Trường Đại học Đà Lạt (DLU)"
    >
      <Image
        src="/dlu-logo.png"
        alt="Trường Đại học Đà Lạt"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-contain rounded-full"
        priority
      />
    </div>
  );
};

