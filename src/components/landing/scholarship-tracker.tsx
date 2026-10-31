"use client";

import * as React from "react";
import Link from "next/link";
import { HeartHandshake, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

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
  if (!campaign) {
    return null;
  }

  const current = Number(campaign.currentAmount || 0);
  const target = Number(campaign.targetAmount || 1);
  const percent = Math.min(100, Math.round((current / (target || 1)) * 100));

  const campaignTitle = campaign.title;
  const campaignDescription =
    campaign.description ||
    "Chương trình đồng hành thường niên của Mạng lưới Cựu Sinh Viên và các Doanh nghiệp đối tác. 100% nguồn quỹ được trao tận tay cho sinh viên vượt khó hiếu học và khen thưởng các đề tài nghiên cứu khoa học xuất sắc.";
  const campaignHref = `/scholarships/${campaign.id}`;

  const pledgeCount = campaign.pledges?.length || 0;
  const applicationCount = campaign.applications?.length || 0;

  return (
    <section className="w-full bg-gradient-to-b from-blossom-50/70 via-white to-canvas py-14 sm:py-20 border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <div className="rounded-3xl border border-blossom-700/20 bg-white p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-brand">
            {/* Background watermark */}
            <div className="absolute right-4 -bottom-10 pointer-events-none opacity-5 text-blossom-700 hidden sm:block">
              <HeartHandshake className="size-96" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Overview & Cause */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-blossom-700/30 bg-blossom-50 px-3.5 py-1 text-xs font-mono font-semibold text-blossom-800">
                  <HeartHandshake className="size-3.5 text-blossom-700" />
                  <span>QUỸ PHÁT TRIỂN TÀI NĂNG &amp; KHUYẾN HỌC DLU</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-snug">
                  {campaignTitle}
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl font-sans">
                  {campaignDescription}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    render={<Link href="/employer/scholarships/pledge" />}
                    nativeButton={false}
                    variant="sun"
                    size="default"
                    className="font-bold text-xs shadow-sun"
                  >
                    <HeartHandshake className="size-4 mr-1.5" />
                    Đồng hành tài trợ ngay
                  </Button>

                  <Button
                    render={<Link href={campaignHref} />}
                    nativeButton={false}
                    variant="outline"
                    size="default"
                    className="font-semibold text-xs border-blossom-700/30 text-blossom-900 hover:bg-blossom-50"
                  >
                    Nộp hồ sơ xin học bổng
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </div>
              </div>

              {/* Right Column: Progress & Transparency Metrics */}
              <div className="lg:col-span-5 rounded-2xl border border-blossom-700/20 bg-blossom-50/40 p-6 sm:p-7 space-y-5 shadow-sm backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider font-bold text-pine-800">
                    Tiến độ tiếp nhận nguồn quỹ
                  </span>
                  <span className="font-mono text-xs font-bold text-blossom-800 bg-blossom-50 px-2 py-0.5 rounded-full border border-blossom-700/20 flex items-center gap-1">
                    <TrendingUp className="size-3.5 text-blossom-700" />
                    {percent}% Mục tiêu
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-white rounded-full overflow-hidden border border-blossom-700/20 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blossom-700 to-sun-500 transition-all duration-1000 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                        ĐÃ TIẾP NHẬN:
                      </span>
                      <span className="font-bold text-pine-900 text-sm sm:text-base">
                        {current.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                        MỤC TIÊU:
                      </span>
                      <span className="font-bold text-muted-foreground text-sm sm:text-base">
                        {target.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Impact stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blossom-700/15 text-center">
                  <div className="p-3 rounded-xl bg-white border border-border shadow-xs">
                    <div className="font-mono text-base font-bold text-pine-800">
                      {applicationCount} Hồ Sơ
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      Đã nộp xét duyệt
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-border shadow-xs">
                    <div className="font-mono text-base font-bold text-sun-700">
                      {pledgeCount} Lượt
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      Cam kết tài trợ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
