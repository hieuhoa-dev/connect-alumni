"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

export const PartnerLogos = () => {
  const partners = [
    { name: "VNG Corporation", domain: "Gaming & Fintech" },
    { name: "FPT Software", domain: "Enterprise AI & Cloud" },
    { name: "Viettel Solutions", domain: "Telecom & Cyber Security" },
    { name: "MoMo Fintech", domain: "Digital Payments" },
    { name: "KMS Technology", domain: "Software Engineering" },
    { name: "NashTech Global", domain: "Consulting & Tech" },
  ];

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="rounded-xl border border-border/70 bg-card p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              MẠNG LƯỚI DOANH NGHIỆP ĐỐI TÁC CHIẾN LƯỢC
            </span>
          </div>
          <Link
            href="/employer/onboarding"
            className="text-xs font-mono font-medium text-foreground hover:underline inline-flex items-center gap-1"
          >
            <span>Trở thành đối tác của Khoa</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {partners.map((p) => (
            <div
              key={p.name}
              className="p-3 rounded-lg border border-border/60 bg-background/80 hover:bg-muted/40 transition-colors text-center space-y-1"
            >
              <span className="font-mono text-xs font-bold text-foreground block truncate">
                {p.name}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {p.domain}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
