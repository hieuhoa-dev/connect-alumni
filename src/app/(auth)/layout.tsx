import type * as React from "react";
import { DluLogo } from "@/components/shared/dlu-logo";
import { SITE } from "@/lib/site-config";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-muted/20">
      <header className="p-6">
        <a
          href="/"
          aria-label="Tải lại trang chủ DLU Alumni"
          className="inline-flex items-center gap-3 font-semibold text-foreground"
        >
          <DluLogo className="size-11" alt="" />
          <span>{SITE.appName}</span>
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="p-6 text-center text-xs text-muted-foreground">
        © 2026 {SITE.appName} · Dự án kết nối cộng đồng
      </footer>
    </div>
  );
};

export default AuthLayout;
