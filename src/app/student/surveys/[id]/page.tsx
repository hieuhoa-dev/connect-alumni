import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormById } from "@/actions/form-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Clock, ShieldCheck, ExternalLink, Sparkles } from "lucide-react";
import { SurveyFormRenderer } from "./form-renderer";

interface SurveyDetailPageProps {
  params: Promise<{ id: string }>;
}

const SurveyDetailPage = async ({ params }: SurveyDetailPageProps) => {
  const { id } = await params;
  const form = await getFormById(id);

  if (!form) {
    notFound();
  }

  const isExpired = form.deadline
    ? new Date(form.deadline) < new Date()
    : false;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/student/surveys"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "gap-1.5 text-xs text-muted-foreground",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách khảo sát
        </Link>
      </div>

      <Card className="shadow-sm border-primary/20">
        <CardHeader className="space-y-2 border-b border-border/60 pb-4">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className="text-xs uppercase font-semibold"
            >
              {form.type}
            </Badge>
            {form.deadline && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Hạn chót: {new Date(form.deadline).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {form.title}
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            {form.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {form.isGoogleForm && form.googleFormUrl ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-pine-200 dark:border-pine-800 bg-pine-50/70 dark:bg-pine-950/40 p-5 text-center space-y-4">
                <div className="inline-flex items-center justify-center size-12 rounded-full bg-pine-100 dark:bg-pine-900/60 text-pine-700 dark:text-pine-300 mx-auto">
                  <Sparkles className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-pine-900 dark:text-pine-100">
                    Khảo sát trực tuyến qua Google Form
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Khảo sát này được thiết lập qua nền tảng Google Form để giúp bạn thao tác nhanh chóng và mượt mà trên cả điện thoại di động lẫn máy tính.
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={form.googleFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-pine-700 hover:bg-pine-800 text-white px-6 py-2.5 text-sm font-medium shadow-sm transition-all"
                  >
                    <span>Mở khảo sát trên Google Form</span>
                    <ExternalLink className="size-4" />
                  </a>
                </div>

                <p className="text-[11px] text-muted-foreground pt-1">
                  * Kết quả khảo sát sẽ được đồng bộ tự động về tài khoản của bạn thông qua Webhook ngay khi hoàn thành.
                </p>
              </div>

              {/* Embedded preview frame */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Hoặc bạn có thể điền trực tiếp tại đây:
                </p>
                <div className="rounded-xl border border-border overflow-hidden bg-background h-[650px] shadow-xs">
                  <iframe
                    src={form.googleFormUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    title={form.title}
                  >
                    Đang tải biểu mẫu khảo sát...
                  </iframe>
                </div>
              </div>
            </div>
          ) : (
            <SurveyFormRenderer form={form} isExpired={isExpired} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyDetailPage;
