"use client";

import * as React from "react";
import { Mail, Check, ShieldCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export const NewsletterBox = () => {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      toast.success("Đăng ký nhận bản tin Cựu sinh viên thành công!");
    }, 500);
  };

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-10 lg:p-12 text-center max-w-4xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-mono text-muted-foreground">
          <Mail className="size-3.5 text-foreground" />
          <span>BẢN TIN E-NEWSLETTER ĐỊNH KỲ</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Đăng ký nhận Bản tin Cựu Sinh Viên Khoa CNTT
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Nhận thông tin tuyển dụng IT chất lượng cao, lịch các buổi talkshow kết nối và báo cáo hoạt động Quỹ Khuyến học gửi định kỳ vào hộp thư của bạn mỗi tháng.
        </p>

        {isSubscribed ? (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-medium inline-flex items-center gap-2 max-w-md mx-auto">
            <Check className="size-4 shrink-0" />
            <span>Cảm ơn bạn! Bản tin số mới nhất sẽ được gửi đến {email}.</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn (ví dụ: alumni@gmail.com)"
              required
              className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              type="submit"
              size="default"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-10 px-5 text-xs font-medium shrink-0"
            >
              <Send className="size-3.5 mr-1.5" />
              {isSubmitting ? "Đang xử lý..." : "Đăng ký nhận tin"}
            </Button>
          </form>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-muted-foreground pt-2">
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3 text-emerald-600" />
            Bảo mật thông tin 100%
          </span>
          <span>•</span>
          <span>Không gửi thư rác (No Spam)</span>
          <span>•</span>
          <span>Hủy đăng ký bất cứ lúc nào</span>
        </div>
      </div>
    </section>
  );
};
