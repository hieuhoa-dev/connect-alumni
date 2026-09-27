import * as React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-muted/20">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span>CONNECT ALUMNI</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="p-6 text-center text-xs text-muted-foreground">
        © 2026 Khoa Công nghệ Thông tin. Nền tảng kết nối Sinh viên – Cựu sinh viên – Doanh nghiệp.
      </footer>
    </div>
  );
};

export default AuthLayout;
