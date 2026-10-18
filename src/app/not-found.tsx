import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Home, Compass } from "lucide-react";
import { DLULogo } from "@/components/shared/dlu-logo";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <DLULogo size={64} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-sun-600 dark:text-sun-400">
            Lỗi 404 • Không tìm thấy trang
          </span>
          <h1 className="text-3xl font-extrabold font-serif text-foreground tracking-tight sm:text-4xl">
            Lạc lối giữa đồi thông
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển sang địa chỉ mới. Vui lòng kiểm tra lại liên kết.
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
            href="/jobs"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "w-full sm:w-auto gap-2 font-medium",
            })}
          >
            <Compass className="size-4" />
            Khám phá cơ hội
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
