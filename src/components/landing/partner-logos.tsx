"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ContentImage } from "@/components/shared/content-image";
import type { PartnerCompanyDto } from "@/types/partners";

interface PartnerLogosProps {
  partners?: PartnerCompanyDto[];
}

export const PartnerLogos = ({ partners = [] }: PartnerLogosProps) => {
  if (!partners || partners.length === 0) {
    return null;
  }

  // Duplicate for smooth marquee effect
  const trackItems = partners.length < 8 ? [...partners, ...partners, ...partners] : [...partners, ...partners];

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
                  MẠNG LƯỚI DOANH NGHIỆP ĐỐI TÁC
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
          {trackItems.map((p, idx) => (
            <div
              key={`${p.id}-${idx}`}
              className="shrink-0 w-60 sm:w-64 p-4 rounded-xl border border-border bg-canvas/60 hover:bg-white hover:border-pine-300 hover:shadow-brand transition-all duration-300 flex items-center gap-3.5 group cursor-default"
            >
              <div className="size-12 rounded-lg bg-white border border-border/70 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <ContentImage
                  file={p.logoUrl}
                  alt={p.name}
                  width={48}
                  height={48}
                  fallbackType="avatar"
                  className="object-contain size-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {p.name}
                  </span>
                  {p.isFeaturedPartner && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold shrink-0">
                      Chiến Lược
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate block mt-0.5">
                  {p.industry}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
