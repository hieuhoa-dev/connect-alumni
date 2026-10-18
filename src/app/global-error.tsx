"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  React.useEffect(() => {
    console.error("Global uncaught error:", error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="size-16 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center">
              <AlertTriangle className="size-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Sự cố hệ thống nghiêm trọng
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Đã xảy ra lỗi ngoài dự kiến trong tầng layout gốc. Vui lòng bấm thử lại để tải lại phiên ứng dụng.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => reset()}
              className="gap-2 font-medium"
            >
              <RefreshCw className="size-4" />
              Khôi phục phiên làm việc
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
