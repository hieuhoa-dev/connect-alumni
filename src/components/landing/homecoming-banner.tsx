"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Heart, ArrowRight, ShieldCheck, Award } from "lucide-react";

export const HomecomingBanner = () => {
  return (
    <section id="homecoming" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Editorial Academic Banner Card */}
      <div className="relative rounded-2xl border border-border/80 bg-card overflow-hidden">
        {/* Subtle background ambient line pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-[0.03] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-12 items-center">
          {/* Left Text & Slogan */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-mono text-foreground">
              <Heart className="size-3 text-rose-500 fill-rose-500" />
              <span>Welcome Home · Cổng Cựu Sinh Viên</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
              Mừng bạn trở về nhà.{" "}
              <span className="italic block sm:inline font-serif font-light text-foreground/80">
                Nơi hội tụ, tri ân và tiếp bước tương lai.
              </span>
            </h2>

            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Dù bạn đang là lập trình viên trẻ, chuyên gia công nghệ hay nhà sáng lập doanh nghiệp, mạng lưới Cựu sinh viên Khoa CNTT luôn là điểm tựa kết nối, sẻ chia cơ hội và cùng nâng bước thế hệ đàn em.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                render={<Link href="/register" />}
                nativeButton={false}
                size="lg"
                className="font-medium text-xs sm:text-sm h-10 px-5"
              >
                Cập nhật thông tin Cựu SV
                <ArrowRight className="size-3.5 ml-2" />
              </Button>
              <Button
                render={<Link href="/#chapters" />}
                nativeButton={false}
                variant="outline"
                size="lg"
                className="font-medium text-xs sm:text-sm h-10 px-5"
              >
                Tra cứu Ban liên lạc các khóa
              </Button>
            </div>
          </div>

          {/* Right Landmark Badge (Như dải 60 năm trong ảnh CTU) */}
          <div className="lg:col-span-4 flex lg:justify-end">
            <div className="w-full sm:w-auto p-6 rounded-xl border border-border/80 bg-background/90 backdrop-blur-xs flex flex-col items-center text-center space-y-3">
              <div className="flex items-center justify-center size-14 rounded-full border border-border bg-muted/60 text-foreground">
                <Award className="size-7 text-amber-600" />
              </div>

              <div>
                <span className="font-serif text-3xl font-bold tracking-tight text-foreground block">
                  30 NĂM
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                  1996 — 2026
                </span>
              </div>

              <div className="h-px w-16 bg-border" />

              <p className="text-xs text-muted-foreground leading-snug">
                Kiến tạo tri thức công nghệ · Tiếp bước tiên phong vì sự phát triển đất nước.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Key Stats Bar */}
        <div className="border-t border-border/70 bg-muted/30 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/60">
          <div className="p-4 text-center">
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              5,000+
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Cựu sinh viên kết nối
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              50+
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Doanh nghiệp đối tác
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              500M+
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Quỹ học bổng hỗ trợ
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              100%
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Thông tin xác thực qua Khoa
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
