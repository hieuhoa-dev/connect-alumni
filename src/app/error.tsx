"use client";

import * as React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { DLULogo } from "@/components/shared/dlu-logo";

const ErrorBoundary = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  React.useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="size-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shadow-xs">
            <AlertTriangle className="size-8" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-destructive">
            Đã xảy ra sự cố
          </span>
          <h1 className="text-2xl font-bold font-serif text-foreground tracking-tight sm:text-3xl">
            Có lỗi phát sinh trong quá trình xử lý
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hệ thống đã ghi nhận sự cố này để đội ngũ kỹ thuật kiểm tra và khắc phục. Vui lòng thử tải lại trang.
          </p>
          {error?.message && (
            <p className="text-xs font-mono text-muted-foreground/80 bg-muted/60 p-2.5 rounded-lg border border-border/60 text-left line-clamp-3">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="default"
            size="sm"
            className="w-full sm:w-auto gap-2 font-medium shadow-brand"
          >
            <RefreshCw className="size-4" />
            Thử tải lại
          </Button>
          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "w-full sm:w-auto gap-2 font-medium",
            })}
          >
            <Home className="size-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
