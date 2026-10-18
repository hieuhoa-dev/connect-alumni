import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { DLULogo } from "@/components/shared/dlu-logo";
import { ArrowLeft } from "lucide-react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden text-foreground">
      {/* Background Image dlu_1.jpg with high-contrast atmospheric overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/dlu_1.jpg"
          alt="Trường Đại học Đà Lạt"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Deep Pine & Scrim Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-pine-950/92 via-pine-900/80 to-pine-950/85 backdrop-blur-[1px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-3 transition hover:opacity-95 group"
          >
            <div className="rounded-full bg-white p-1 shadow-md">
              <DLULogo size={38} />
            </div>
            <div className="flex flex-col text-white">
              <span className="font-extrabold text-base sm:text-lg tracking-tight leading-none text-white">
                DLU CONNECT
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-gold-300 leading-tight mt-0.5 uppercase tracking-wider">
                Trường Đại học Đà Lạt
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 transition-all active:scale-95"
          >
            <ArrowLeft className="size-3.5" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 sm:p-6 text-center text-xs text-pine-200/90 font-sans">
        © 2026 Trường Đại học Đà Lạt — Khoa Công nghệ Thông tin. Mạng lưới kết nối Cựu sinh viên & Doanh nghiệp.
      </footer>
    </div>
  );
};

export default AuthLayout;
