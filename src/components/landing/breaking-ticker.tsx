"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, ChevronRight, Sparkles } from "lucide-react";

interface BreakingTickerProps {
  items?: {
    id: string;
    tag: string;
    title: string;
    href: string;
    isHot?: boolean;
  }[];
}

const defaultItems = [
  {
    id: "1",
    tag: "QUỸ KHUYẾN HỌC",
    title: "Tiếp nhận hồ sơ xin học bổng Tiếp sức Sinh viên CNTT K22 - Đợt 1 năm học 2026",
    href: "/scholarships",
    isHot: true,
  },
  {
    id: "2",
    tag: "SỰ KIỆN",
    title: "Talkshow 'Lộ trình từ Lập trình viên đến Tech Lead & AI Architect' cùng Cựu sinh viên K12",
    href: "/events",
  },
  {
    id: "3",
    tag: "TUYỂN DỤNG",
    title: "Doanh nghiệp đối tác mở đợt tuyển thực tập sinh & kỹ sư phần mềm chính quy",
    href: "/jobs",
  },
  {
    id: "4",
    tag: "KHẢO SÁT",
    title: "Khoa CNTT phát động khảo sát đóng góp ý kiến hoàn thiện chương trình đào tạo",
    href: "/#survey",
  },
];

export const BreakingTicker = ({ items = defaultItems }: BreakingTickerProps) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const currentItem = items[currentIndex] || items[0];

  return (
    <div className="border-b border-border/70 bg-[#FBF3DB]/40 dark:bg-amber-950/20 text-foreground">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
        <div
          className="flex items-center justify-between gap-3 text-xs"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Label Tag */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 rounded bg-[#956400] text-white px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="size-2.5 animate-pulse" />
              <span>BẢN TIN NÓNG</span>
            </span>
          </div>

          {/* Current Ticker Content */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2 truncate transition-all duration-300">
              <span className="hidden sm:inline-block font-mono text-[11px] font-semibold text-[#956400] dark:text-amber-400 shrink-0">
                [{currentItem.tag}]
              </span>
              <Link
                href={currentItem.href}
                className="truncate font-medium text-foreground hover:underline transition-colors"
              >
                {currentItem.title}
              </Link>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-mono text-[10px] text-muted-foreground mr-1">
              {currentIndex + 1}/{items.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) => (prev + 1) % items.length)
              }
              aria-label="Next notice"
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
