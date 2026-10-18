"use client";

import * as React from "react";
import { ArrowUp, MessageCircle, Share2, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "cn";

export const QuickRail = () => {
  const [scrollY, setScrollY] = React.useState(0);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [mobileExpanded, setMobileExpanded] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((currentScrollY / totalHeight) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showBackToTop = scrollY > 600;

  return (
    <>
      {/* 1. Left Quick Action Rail (Desktop & Mobile with toggle) */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:flex flex-col gap-3">
        {/* Facebook */}
        <a
          href="https://facebook.com/dlu.edu.vn"
          target="_blank"
          rel="noreferrer"
          aria-label="Trang Facebook Trường Đại học Đà Lạt"
          className="group relative flex size-11 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-brand hover:scale-108 transition-all duration-200"
        >
          <svg
            className="size-5 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="absolute left-14 hidden group-hover:block whitespace-nowrap rounded-md bg-pine-900 px-2 py-1 text-xs text-white shadow-md">
            Facebook DLU
          </span>
        </a>

        {/* YouTube */}
        <a
          href="https://youtube.com/@truongdaihocdalat"
          target="_blank"
          rel="noreferrer"
          aria-label="Kênh YouTube Trường Đại học Đà Lạt"
          className="group relative flex size-11 items-center justify-center rounded-full bg-[#E11D1D] text-white shadow-brand hover:scale-108 transition-all duration-200"
        >
          <svg
            className="size-5 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className="absolute left-14 hidden group-hover:block whitespace-nowrap rounded-md bg-pine-900 px-2 py-1 text-xs text-white shadow-md">
            YouTube DLU
          </span>
        </a>

        {/* Zalo / Chat */}
        <a
          href="https://zalo.me"
          target="_blank"
          rel="noreferrer"
          aria-label="Liên hệ Zalo tư vấn Cựu SV"
          className="group relative flex size-11 items-center justify-center rounded-full bg-pine-600 text-white shadow-brand hover:scale-108 transition-all duration-200"
        >
          <MessageCircle className="size-5" />
          <span className="absolute left-14 hidden group-hover:block whitespace-nowrap rounded-md bg-pine-900 px-2 py-1 text-xs text-white shadow-md">
            Hỗ trợ Zalo
          </span>
        </a>
      </div>

      {/* Mobile Rail toggle (+) */}
      <div className="fixed bottom-6 left-4 z-40 sm:hidden">
        {mobileExpanded && (
          <div className="flex flex-col gap-2.5 mb-2.5">
            <a
              href="https://facebook.com/dlu.edu.vn"
              target="_blank"
              rel="noreferrer"
              className="flex size-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-brand"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://youtube.com/@truongdaihocdalat"
              target="_blank"
              rel="noreferrer"
              className="flex size-10 items-center justify-center rounded-full bg-[#E11D1D] text-white shadow-brand"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noreferrer"
              className="flex size-10 items-center justify-center rounded-full bg-pine-600 text-white shadow-brand"
            >
              <MessageCircle className="size-4" />
            </a>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="flex size-11 items-center justify-center rounded-full bg-pine-800 text-white shadow-brand active:scale-95"
          aria-label="Mạng xã hội"
        >
          {mobileExpanded ? <X className="size-5" /> : <Plus className="size-5" />}
        </button>
      </div>

      {/* 2. Right Back-to-Top Button with circular progress indicator */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <button
              type="button"
              onClick={scrollToTop}
              className="relative flex size-11 items-center justify-center rounded-full bg-pine-700 text-white shadow-brand hover:bg-pine-600 transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="Cuộn lên đầu trang"
            >
              {/* Circular progress SVG */}
              <svg className="absolute inset-0 size-11 -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  className="text-white/20"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * scrollProgress) / 100}
                  className="text-sun-500 transition-all duration-100"
                />
              </svg>
              <ArrowUp className="size-5 relative z-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
