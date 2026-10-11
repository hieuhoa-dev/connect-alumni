"use client";

import * as React from "react";
import Link from "next/link";
import { HeartHandshake, ShieldCheck, ArrowRight, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ScholarshipTrackerProps {
  campaign?: {
    id: string;
    title: string;
    description: string | null;
    targetAmount: string | number;
    currentAmount: string | number;
    pledges?: any[];
    applications?: any[];
  } | null;
}

export const ScholarshipTracker = ({ campaign }: ScholarshipTrackerProps) => {
  const current = Number(campaign?.currentAmount || 365000000);
  const target = Number(campaign?.targetAmount || 500000000);
  const percent = Math.min(100, Math.round((current / (target || 1)) * 100));

  const campaignTitle =
    campaign?.title ||
    "Quỹ Khuyến Học Khoa CNTT 2026: Nâng Bước Tài Năng Trẻ";
  const campaignDescription =
    campaign?.description ||
    "Chương trình gây quỹ thường niên do Ban Liên Lạc Cựu Sinh Viên và các Doanh nghiệp công nghệ đồng tổ chức. 100% nguồn quỹ được trao tận tay cho sinh viên có hoàn cảnh khó khăn đạt thành tích xuất sắc và các dự án nghiên cứu khoa học tiềm năng.";
  const campaignHref = campaign?.id
    ? `/scholarships/${campaign.id}`
    : "/scholarships";

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Subtle academic background badge watermark */}
        <div className="absolute right-6 -bottom-10 pointer-events-none opacity-5 text-foreground hidden sm:block">
          <HeartHandshake className="size-80" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Overview & Cause */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F7CDCE]/60 bg-[#FDEBEC] px-3 py-1 text-xs font-mono font-semibold text-[#9F2F2D] dark:bg-rose-950/40 dark:text-rose-300">
              <HeartHandshake className="size-3.5" />
              <span>QUỸ PHÁT TRIỂN TÀI NĂNG & KHUYẾN HỌC</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-snug">
              {campaignTitle}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              {campaignDescription}
            </p>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                render={<Link href={campaignHref} />}
                nativeButton={false}
                size="lg"
                className="font-medium text-xs sm:text-sm h-10 px-5"
              >
                Nộp hồ sơ xin học bổng
                <ArrowRight className="size-3.5 ml-2" />
              </Button>
              <Button
                render={<Link href="/employer/scholarships/pledge" />}
                nativeButton={false}
                variant="outline"
                size="lg"
                className="font-medium text-xs sm:text-sm h-10 px-5"
              >
                Đồng hành & Cam kết tài trợ
              </Button>
            </div>
          </div>

          {/* Right Column: Progress & Transparency Metrics */}
          <div className="lg:col-span-5 rounded-xl border border-border/80 bg-background/90 p-6 space-y-5 shadow-2xs backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Tiến độ tiếp nhận nguồn quỹ
              </span>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="size-3.5" />
                {percent}% Mục tiêu
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/60">
                <div
                  className="h-full bg-foreground transition-all duration-500 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <div>
                  <span className="text-muted-foreground block text-[10px]">
                    ĐÃ TIẾP NHẬN:
                  </span>
                  <span className="font-bold text-foreground text-sm">
                    {current.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[10px]">
                    MỤC TIÊU:
                  </span>
                  <span className="font-bold text-foreground text-sm">
                    {target.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Impact stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60 text-center">
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <div className="font-mono text-base font-bold text-foreground">
                  48 Suất
                </div>
                <div className="text-[10px] text-muted-foreground font-medium">
                  Học bổng đã trao tặng
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <div className="font-mono text-base font-bold text-foreground">
                  32 Nhà tài trợ
                </div>
                <div className="text-[10px] text-muted-foreground font-medium">
                  Cựu sinh viên & Doanh nghiệp
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
