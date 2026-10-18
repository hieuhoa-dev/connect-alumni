"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export const PartnerLogos = () => {
  const partners = [
    { name: "VNG Corporation", domain: "Gaming & Fintech", tag: "Chiến Lược" },
    { name: "FPT Software", domain: "Enterprise AI & Cloud", tag: "Chiến Lược" },
    { name: "Viettel Solutions", domain: "Telecom & Cyber Security", tag: "Đối Tác" },
    { name: "MoMo Fintech", domain: "Digital Payments", tag: "Đối Tác" },
    { name: "KMS Technology", domain: "Software Engineering", tag: "Đối Tác" },
    { name: "NashTech Global", domain: "Consulting & Tech", tag: "Chiến Lược" },
    { name: "TMA Solutions", domain: "Software R&D", tag: "Đối Tác" },
    { name: "Zalo Group", domain: "Social & AI Platform", tag: "Chiến Lược" },
    { name: "VNPT Group", domain: "Digital Transformation", tag: "Chiến Lược" },
  ];

  return (
    <section className="w-full bg-white py-12 sm:py-16 border-y border-border/80 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <Reveal variant="fade">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-pine-50 text-pine-600">
                <Building2 className="size-4" />
              </div>
              <div>
                <h2 className="font-sans text-sm sm:text-base font-extrabold uppercase tracking-tight text-pine-800">
                  MẠNG LƯỚI DOANH NGHIỆP ĐỐI TÁC CHIẾN LƯỢC
                </h2>
                <p className="text-xs text-muted-foreground">
                  Đồng hành cùng Đại học Đà Lạt trong đào tạo, thực tập và phát triển nghề nghiệp
                </p>
              </div>
            </div>

            <Link
              href="/employer/onboarding"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800 hover:text-sky-900 group"
            >
              <span>Trở thành đối tác của Nhà trường</span>
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Marquee Track with gradient fade mask */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex items-center whitespace-nowrap gap-6 animate-marquee hover:[animation-play-state:paused] py-2">
          {[...partners, ...partners].map((p, idx) => (
            <div
              key={`${p.name}-${idx}`}
              className="shrink-0 w-52 sm:w-60 p-4 rounded-xl border border-border bg-canvas/60 hover:bg-white hover:border-pine-300 hover:shadow-brand transition-all duration-300 flex flex-col justify-between group cursor-default"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {p.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pine-100 text-pine-800 font-semibold">
                  {p.tag}
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {p.domain}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
