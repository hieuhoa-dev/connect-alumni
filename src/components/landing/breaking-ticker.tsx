"use client";

import { ChevronRight, Sparkles, Volume2 } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import * as React from "react";
import type { TickerItemDto } from "@/types/ticker";

export const BreakingTicker = ({
  items = [],
}: {
  items?: TickerItemDto[];
}) => {
  const reduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (!reduceMotion) return;
    if (isPaused || !items || items.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [reduceMotion, isPaused, items?.length]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className="relative z-40 h-9 bg-pine-900 border-b border-pine-800 text-white flex items-center overflow-hidden text-xs"
      role="region"
      aria-label="Tin mới cập nhật"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center h-full">
        {/* Slanted Label on the left */}
        <div className="relative flex items-center h-full shrink-0 z-20 pr-4">
          <div className="flex items-center gap-1.5 bg-sun-500 text-ink font-bold text-[11px] px-3 py-1 uppercase tracking-wider rounded-l-md shadow-xs">
            <Sparkles className="size-3 animate-pulse" />
            <span>TIN MỚI</span>
          </div>
          {/* Slanted edge */}
          <div
            className="w-0 h-0 border-y-[13px] border-y-transparent border-l-[10px] border-l-sun-500"
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        {reduceMotion ? (
          // Static cycling mode for reduced motion
          <div className="flex-1 flex items-center justify-between px-3 overflow-hidden">
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono text-[10px] font-bold text-gold-300">
                [{items[currentIndex].tag}]
              </span>
              <Link
                href={items[currentIndex].href}
                className="truncate font-medium hover:text-gold-300 transition-colors"
              >
                {items[currentIndex].title}
              </Link>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <span className="font-mono text-[10px] text-pine-300">
                {currentIndex + 1}/{items.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) => (prev + 1) % items.length)
                }
                className="p-1 text-pine-300 hover:text-white"
                aria-label="Tin tiếp theo"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        ) : (
          // Continuous marquee stream
          <div className="relative flex-1 overflow-hidden h-full flex items-center mask-radial-fade-none">
            <div
              className={`flex items-center whitespace-nowrap gap-12 ${
                isPaused ? "[animation-play-state:paused]" : ""
              } animate-marquee-slow`}
            >
              {[...items, ...items].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex items-center gap-2 shrink-0 group"
                >
                  <span className="font-mono text-[11px] font-bold text-gold-300">
                    [{item.tag}]
                  </span>
                  <Link
                    href={item.href}
                    className="font-medium text-white/95 group-hover:text-gold-300 group-hover:underline transition-colors"
                  >
                    {item.title}
                  </Link>
                  {item.date && (
                    <span className="font-mono text-[10px] text-pine-300">
                      ({item.date})
                    </span>
                  )}
                  <span className="text-pine-600 ml-4">•</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
