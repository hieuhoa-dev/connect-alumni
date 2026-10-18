"use client";

import * as React from "react";
import Link from "next/link";
import { Award, Compass, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export const AnniversaryBand = () => {
  return (
    <section className="relative w-full bg-hero text-white py-10 sm:py-12 border-y border-pine-700/50 overflow-hidden">
      {/* Decorative subtle background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left: 30 Year Badge & Title */}
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="relative flex size-20 sm:size-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-brand">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tighter text-gold-300 leading-none">
                  30
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90 mt-1 text-center leading-tight">
                  NĂM PHÁT TRIỂN
                </span>
                <span className="text-[9px] font-mono text-pine-300">
                  1996 — 2026
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-lime-300 uppercase tracking-widest">
                  <Sparkles className="size-3" />
                  <span>DẤU ẤN TRUYỀN THỐNG KHOA CNTT</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                  Vững Vàng Tri Thức — Kết Nối Tương Lai
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/85 max-w-xl font-sans leading-relaxed">
                  Ba thập kỷ đào tạo hàng ngàn kỹ sư, cử nhân công nghệ đóng góp vào sự phát triển vượt bậc của đất nước và hội nhập toàn cầu.
                </p>
              </div>
            </div>

            {/* Right: Key highlights pill list */}
            <div className="flex flex-wrap items-center gap-4 lg:gap-6 pt-2 lg:pt-0">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/15">
                <ShieldCheck className="size-5 text-gold-300 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-mono text-base font-bold text-white">
                    Kiểm định AUN-QA
                  </span>
                  <span className="text-[11px] text-emerald-200">
                    Chuẩn chất lượng khu vực
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/15">
                <Award className="size-5 text-lime-300 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-mono text-base font-bold text-white">
                    TOP ĐH Uy Tín
                  </span>
                  <span className="text-[11px] text-emerald-200">
                    Khu vực Tây Nguyên & Duyên hải
                  </span>
                </div>
              </div>

              <Link
                href="/experiences"
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gold-300 hover:text-white transition-colors"
              >
                <span>Xem lịch sử phát triển</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
