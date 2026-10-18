"use client";

import * as React from "react";
import { Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export const CtaNewsletter = () => {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="relative w-full bg-hero text-white py-16 sm:py-20 border-t border-pine-700/60 overflow-hidden">
      <div className="container relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <Reveal variant="up" className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 text-gold-300">
            <Mail className="size-3.5" />
            <span>BẢN TIN CỰU SINH VIÊN ĐẠI HỌC ĐÀ LẠT</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-3xl mx-auto">
            Không Bỏ Lỡ Cơ Hội Kết Nối & Tin Tức Mới Nhất
          </h2>

          <p className="text-sm sm:text-base text-emerald-100/85 max-w-2xl mx-auto leading-relaxed font-sans">
            Đăng ký nhận thông báo về ngày hội DLU Homecoming, các cơ hội học bổng, hội thảo chuyên đề và tin tức tuyển dụng độc quyền từ mạng lưới doanh nghiệp đối tác.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 text-white max-w-md mx-auto">
              <CheckCircle2 className="size-5 text-lime-300 shrink-0" />
              <span className="text-sm font-semibold">
                Cảm ơn bạn! Đã đăng ký thành công bản tin DLU Alumni.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto pt-2"
            >
              <div className="relative w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email của bạn..."
                  required
                  className="w-full h-11 px-4 rounded-xl bg-white text-ink placeholder:text-muted-foreground text-sm outline-none border border-transparent focus:border-sun-500 focus:ring-3 focus:ring-sun-500/30 transition-all"
                />
              </div>
              <Button
                type="submit"
                variant="sun"
                size="lg"
                className="w-full sm:w-auto h-11 rounded-xl px-6 text-sm font-semibold shrink-0"
              >
                <span>Đăng ký</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </form>
          )}

          <div className="flex items-center justify-center gap-6 text-xs text-emerald-200/70 pt-2 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-lime-300" />
              Bảo mật 100%
            </span>
            <span>•</span>
            <span>Hủy đăng ký bất cứ lúc nào</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
