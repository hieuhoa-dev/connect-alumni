"use client";

import * as React from "react";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Clock,
  Compass,
  Copy,
  Check,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

const GOOGLE_MAPS_LINK =
  "https://www.google.com/maps/place/A7+Khoa+C%C3%B4ng+ngh%E1%BB%87+Th%C3%B4ng+tin/@11.9558816,108.4465096,17z/data=!3m1!4b1!4m6!3m5!1s0x317112db826dc281:0x7a577a72a3694368!8m2!3d11.9558816!4d108.4465096!16s%2Fg%2F11c1skb09z?entry=ttu&g_ep=EgoyMDI2MTAxMy4wIKXMDSoASAFQAw%3D%3D";

const EMBED_MAP_SRC =
  "https://maps.google.com/maps?q=11.9558816,108.4465096&hl=vi&z=17&output=embed";

export const ContactSection = () => {
  const [copiedPhone, setCopiedPhone] = React.useState(false);
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText("(+84) 91 184 39 62");
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("it@dlu.edu.vn");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section className="relative w-full py-16 lg:py-20 bg-linear-to-b from-background via-pine-50/50 to-background border-t border-pine-100 dark:border-pine-900/60 overflow-hidden">
      {/* Decorative ambient blurred orbs */}
      <div
        className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-pine-200/40 dark:bg-pine-900/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 -right-32 w-96 h-96 rounded-full bg-sun-200/30 dark:bg-sun-950/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pine-100 text-pine-800 dark:bg-pine-900/70 dark:text-pine-200 mb-3 border border-pine-200 dark:border-pine-800">
              <Compass className="size-3.5 text-primary" />
              Kết Nối Trực Tiếp
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
              Thông Tin Liên Hệ
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Văn phòng Ban chủ nhiệm & Văn phòng Khoa Công nghệ Thông tin — Trường Đại học Đà Lạt luôn chào đón cựu sinh viên, đối tác doanh nghiệp và các bạn học viên.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Office & Contact Details (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <Reveal delay={0.1}>
              <div className="bg-card rounded-2xl border border-pine-200/80 dark:border-pine-900/70 p-6 sm:p-7 shadow-brand hover:shadow-brand-hover transition-all">
                {/* Faculty badge & name */}
                <div className="flex items-start gap-4 pb-6 border-b border-border/60">
                  <div className="size-13 rounded-xl bg-gradient-to-br from-pine-600 to-pine-800 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Building className="size-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sun-600 dark:text-sun-400 font-mono">
                      Faculty of Information Technology
                    </span>
                    <h3 className="text-xl font-extrabold text-foreground mt-0.5">
                      Khoa Công nghệ Thông tin
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Trường Đại học Đà Lạt (DLU)
                    </p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-4 pt-6 text-sm">
                  {/* Address */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="size-9 rounded-lg bg-pine-100 dark:bg-pine-900/60 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-0.5">
                      <MapPin className="size-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Địa chỉ văn phòng
                      </p>
                      <p className="font-medium text-foreground leading-snug mt-0.5">
                        Tầng 2 Tòa nhà A7, 01 Phù Đổng Thiên Vương, Phường 8, TP. Đà Lạt, Tỉnh Lâm Đồng
                      </p>
                    </div>
                  </div>

                  {/* Hotline */}
                  <div className="flex items-center justify-between gap-3.5 group">
                    <div className="flex items-center gap-3.5">
                      <div className="size-9 rounded-lg bg-pine-100 dark:bg-pine-900/60 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Phone className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Hotline hỗ trợ
                        </p>
                        <a
                          href="tel:+84911843962"
                          className="font-bold text-foreground hover:text-primary transition-colors text-base"
                        >
                          (+84) 91 184 39 62
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      title="Sao chép số điện thoại"
                      className="size-8 rounded-md flex items-center justify-center border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {copiedPhone ? (
                        <Check className="size-3.5 text-primary" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between gap-3.5 group">
                    <div className="flex items-center gap-3.5">
                      <div className="size-9 rounded-lg bg-pine-100 dark:bg-pine-900/60 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Mail className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Hộp thư điện tử
                        </p>
                        <a
                          href="mailto:it@dlu.edu.vn"
                          className="font-bold text-foreground hover:text-primary transition-colors font-mono text-sm"
                        >
                          it@dlu.edu.vn
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      title="Sao chép email"
                      className="size-8 rounded-md flex items-center justify-center border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {copiedEmail ? (
                        <Check className="size-3.5 text-primary" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Working hours */}
                  <div className="flex items-start gap-3.5 pt-2 border-t border-border/50">
                    <div className="size-9 rounded-lg bg-sun-100 dark:bg-sun-950/60 text-sun-600 dark:text-sun-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Thời gian làm việc
                      </p>
                      <p className="text-xs font-medium text-foreground mt-0.5">
                        Thứ Hai – Thứ Sáu: 07:30 – 11:30 | 13:00 – 17:00
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        (Trừ các ngày nghỉ lễ theo quy định)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary CTA button */}
                <div className="pt-6 mt-6 border-t border-border/60">
                  <Button
                    variant="sun"
                    className="w-full justify-center gap-2 shadow-sun py-2.5 font-bold cursor-pointer"
                    render={
                      <a
                        href={GOOGLE_MAPS_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <span>Mở vị trí trên Google Maps</span>
                    <ExternalLink className="size-4" />
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Google Maps Interactive Embed Card (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <Reveal delay={0.2} className="h-full">
              <div className="bg-card rounded-2xl border border-pine-200/80 dark:border-pine-900/70 overflow-hidden shadow-brand hover:shadow-brand-hover transition-all flex flex-col h-full min-h-[380px] lg:min-h-[460px]">
                {/* Header over map */}
                <div className="p-4 sm:px-6 bg-linear-to-r from-pine-900 to-pine-800 text-white flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <h4 className="text-sm font-bold leading-tight">
                        A7 Khoa Công nghệ Thông tin
                      </h4>
                      <p className="text-[11px] text-pine-200 font-mono">
                        11.9558816, 108.4465096 — ĐH Đà Lạt
                      </p>
                    </div>
                  </div>
                  <a
                    href={GOOGLE_MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                  >
                    <span>Xem toàn màn hình</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                {/* Map iframe */}
                <div className="relative flex-1 w-full min-h-[320px] bg-muted/40">
                  <iframe
                    title="Vị trí Khoa Công nghệ Thông tin Tòa nhà A7 - Đại học Đà Lạt"
                    src={EMBED_MAP_SRC}
                    width="100%"
                    height="100%"
                    className="w-full h-full border-0 absolute inset-0 filter saturate-105"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Bottom map caption */}
                <div className="px-5 py-3 bg-card border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" />
                    Tòa nhà A7 nằm tại cổng số 1 đường Phù Đổng Thiên Vương
                  </span>
                  <a
                    href={GOOGLE_MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium font-sans inline-flex items-center gap-1"
                  >
                    Chỉ đường
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
