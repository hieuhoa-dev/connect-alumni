import * as React from "react";
import Image from "next/image";

interface DLULogoProps {
  className?: string;
  size?: number;
}

export const DLULogo = ({ className = "", size = 40 }: DLULogoProps) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden shadow-xs ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/dlu-logo.svg"
        alt="Trường Đại học Đà Lạt"
        width={size}
        height={size}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
