import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { DLULogo } from "@/components/shared/dlu-logo";

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <ShieldAlert className="size-8" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Lỗi 403 • Truy cập bị từ chối
          </span>
          <h1 className="text-2xl font-bold font-serif text-foreground tracking-tight sm:text-3xl">
            Không đủ quyền hạn truy cập
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tài khoản của bạn không có vai trò hoặc đặc quyền cần thiết để truy cập phân hệ hoặc thực hiện tác vụ này.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "w-full sm:w-auto gap-2 font-medium shadow-brand",
            })}
          >
            <Home className="size-4" />
            Về trang chủ
          </Link>
          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "w-full sm:w-auto gap-2 font-medium",
            })}
          >
            <ArrowLeft className="size-4" />
            Bảng điều khiển của tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
