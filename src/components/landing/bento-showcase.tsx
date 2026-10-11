"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Briefcase,
  Award,
  ArrowRight,
  MapPin,
  Clock,
  Building2,
  Users,
  Quote,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BentoShowcaseProps {
  leadEvent?: {
    id: string;
    title: string;
    description: string | null;
    startTime: Date | string;
    locationOrLink: string | null;
    coverImageUrl: string | null;
    type: string;
    format: string;
    registrationsCount?: number;
  };
  featuredJobs?: {
    id: string;
    title: string;
    jobType: string;
    location: string;
    salaryRange: string | null;
    company?: {
      name: string;
      logoUrl?: string | null;
    } | null;
  }[];
  spotlightAlumni?: {
    name: string;
    role: string;
    company: string;
    gradYear: string;
    quote: string;
    avatarUrl: string;
    profileUrl?: string;
  };
}

export const BentoShowcase = ({
  leadEvent,
  featuredJobs = [],
  spotlightAlumni,
}: BentoShowcaseProps) => {
  // Dữ liệu mẫu dự phòng sắc nét nếu chưa có event từ DB
  const event = leadEvent || {
    id: "lead-alumni-gala-2026",
    title: "IT ALUMNI HOMECOMING 2026: KHÁT VỌNG VƯƠN XA & KẾT NỐI TƯƠNG LAI SỐ",
    description:
      "Ngày hội kỷ niệm 30 năm thành lập Khoa CNTT. Nơi hội tụ hơn 1,000 cựu sinh viên các thế hệ, cùng tọa đàm định hướng công nghệ AI, chuyển đổi số và công bố Quỹ Khuyến học niên khóa mới.",
    startTime: new Date("2026-11-20T08:00:00"),
    locationOrLink: "Hội trường A - Đại học Quốc Gia TP.HCM",
    coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    type: "Hội nghị thường niên",
    format: "Trực tiếp",
    registrationsCount: 342,
  };

  // Cựu sinh viên tiêu biểu mặc định (tương tự cột "THÀNH CÔNG" trong ảnh NEU)
  const alumni = spotlightAlumni || {
    name: "TS. Nguyễn Minh Khang",
    role: "Giám đốc Nghiên cứu AI & Công nghệ Đám mây",
    company: "Viettel AI & Cloud Solutions",
    gradYear: "Cựu SV Khóa K10 (2006 - 2010)",
    quote:
      "Khoa CNTT không chỉ trang bị cho chúng tôi tư duy thuật toán vững chắc, mà còn truyền ngọn lửa không ngừng dấn thân và tinh thần phụng sự cộng đồng.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    profileUrl: "/experiences",
  };

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial Section Title */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 bg-foreground rounded-xs" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground uppercase">
            Tiêu Điểm Mạng Lưới
          </h2>
          <span className="text-xs text-muted-foreground font-mono ml-2 hidden sm:inline">
            // SPOTLIGHT & EDITORIAL HUB
          </span>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          Cập nhật: Mới nhất
        </div>
      </div>

      {/* 3-Column Bento Grid (Phản ánh cấu trúc ảnh NEU Alumni) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ─── CỘT 1: KẾT NỐI (Lead Story Showcase - 6 cols) ─────────────── */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-xl border border-border/80 bg-card overflow-hidden hover:border-foreground/30 transition-colors">
          <div>
            {/* Header tag */}
            <div className="px-5 py-3 border-b border-border/70 flex items-center justify-between bg-muted/30">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                <span className="size-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                KẾT NỐI & TIÊU ĐIỂM
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                Sự kiện Trọng tâm
              </span>
            </div>

            {/* Large Lead Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <img
                src={event.coverImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"}
                alt={event.title}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-102"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded bg-foreground text-background">
                  {event.type}
                </span>
                <span className="px-2 py-1 text-[10px] font-mono font-medium rounded bg-background/90 text-foreground border border-border/60 backdrop-blur-xs">
                  {event.format === "online" ? "Trực tuyến" : "Trực tiếp"}
                </span>
              </div>
            </div>

            {/* Story Details */}
            <div className="p-5 sm:p-6 space-y-3">
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug tracking-tight text-foreground hover:text-primary transition-colors">
                <Link href={`/events/${event.id}`}>{event.title}</Link>
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {event.description}
              </p>

              {/* Meta indicators */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground pt-1 border-t border-border/50">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  {new Date(event.startTime).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5 truncate max-w-[220px]">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  {event.locationOrLink || "Đại học Quốc Gia"}
                </span>
                <span className="flex items-center gap-1.5 ml-auto text-emerald-700 dark:text-emerald-400 font-semibold">
                  <Users className="size-3.5" />
                  {event.registrationsCount || 100}+ Đã đăng ký
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-5 pt-0">
            <Button
              render={<Link href={`/events/${event.id}`} />}
              nativeButton={false}
              className="w-full text-xs font-medium justify-center h-9"
            >
              <span>Xem chương trình & Đăng ký tham gia</span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* ─── CỘT 2: CHIA SẺ & HỢP TÁC (Opportunities - 3 cols) ─────────── */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Box 1: Tuyển dụng Cựu sinh viên */}
          <div className="flex-1 rounded-xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between hover:border-foreground/30 transition-colors">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/70 mb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-sky-600" />
                  CHIA SẺ · TUYỂN DỤNG
                </span>
                <Link
                  href="/jobs"
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground"
                >
                  Tất cả &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {featuredJobs.length > 0 ? (
                  featuredJobs.slice(0, 2).map((job) => (
                    <div
                      key={job.id}
                      className="p-3 rounded-lg border border-border/70 bg-background hover:bg-muted/40 transition-colors space-y-1.5"
                    >
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-xs font-semibold text-foreground hover:underline line-clamp-1 block"
                      >
                        {job.title}
                      </Link>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Building2 className="size-3" />
                        <span className="truncate">{job.company?.name || "Doanh nghiệp đối tác"}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-muted-foreground">
                        <span>{job.location}</span>
                        {job.salaryRange && (
                          <span className="font-semibold text-foreground">
                            {job.salaryRange}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 rounded-lg border border-border/70 bg-background space-y-1.5">
                      <Link
                        href="/jobs"
                        className="text-xs font-semibold text-foreground hover:underline line-clamp-1 block"
                      >
                        Senior AI/ML Engineer
                      </Link>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Building2 className="size-3" />
                        <span>FPT Software AI Lab</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-muted-foreground">
                        <span>Hà Nội / Remote</span>
                        <span className="font-semibold text-foreground">35M - 55M đ</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-border/70 bg-background space-y-1.5">
                      <Link
                        href="/jobs"
                        className="text-xs font-semibold text-foreground hover:underline line-clamp-1 block"
                      >
                        Fullstack Developer (Node/React)
                      </Link>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Building2 className="size-3" />
                        <span>VNG Corporation</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-muted-foreground">
                        <span>TP. Hồ Chí Minh</span>
                        <span className="font-semibold text-foreground">22M - 38M đ</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border/50 mt-3">
              <Link
                href="/employer/jobs/new"
                className="text-[11px] text-muted-foreground hover:text-foreground font-mono flex items-center justify-between"
              >
                <span>+ Đăng tin tuyển dụng mới</span>
                <span className="text-xs">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Box 2: Hợp tác Doanh nghiệp */}
          <div className="rounded-xl border border-border/80 bg-[#E1F3FE]/30 dark:bg-sky-950/20 p-4 sm:p-5 hover:border-foreground/30 transition-colors">
            <div className="flex items-center justify-between pb-2 mb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1F6C9F] dark:text-sky-300">
                HỢP TÁC DOANH NGHIỆP
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mạng lưới hơn 50 tập đoàn công nghệ ký kết đồng hành: tài trợ học bổng, tiếp nhận thực tập và bảo trợ dự án nghiên cứu khoa học.
            </p>
            <div className="pt-3">
              <Link
                href="/employer/onboarding"
                className="text-xs font-medium text-foreground underline underline-offset-4 hover:opacity-80 inline-flex items-center gap-1"
              >
                <span>Đăng ký đối tác Khoa CNTT</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── CỘT 3: THÀNH CÔNG (Alumni Hall of Fame - 3 cols) ──────────── */}
        <div className="lg:col-span-3 flex flex-col justify-between rounded-xl border border-border/80 bg-card overflow-hidden hover:border-foreground/30 transition-colors">
          <div>
            <div className="px-5 py-3 border-b border-border/70 flex items-center justify-between bg-muted/30">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Award className="size-3.5 text-amber-600" />
                GƯƠNG MẶT THÀNH CÔNG
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                ALUMNI HALL
              </span>
            </div>

            {/* Portrait Image */}
            <div className="p-5 pb-3">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={alumni.avatarUrl}
                  alt={alumni.name}
                  className="h-full w-full object-cover grayscale-20 hover:grayscale-0 transition-all duration-300"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-xs p-2 rounded text-[10px] font-mono border border-border/60">
                  <span className="font-bold text-foreground block truncate">
                    {alumni.name}
                  </span>
                  <span className="text-muted-foreground block truncate">
                    {alumni.gradYear}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio & Quote */}
            <div className="px-5 pb-4 space-y-2.5">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {alumni.role}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {alumni.company}
                </p>
              </div>

              <div className="relative rounded-lg bg-muted/40 p-3 border border-border/60 text-xs text-muted-foreground italic leading-relaxed">
                <Quote className="size-3 text-muted-foreground/60 inline mr-1" />
                <span>&ldquo;{alumni.quote}&rdquo;</span>
              </div>
            </div>
          </div>

          <div className="p-5 pt-0">
            <Button
              render={<Link href="/experiences" />}
              nativeButton={false}
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium justify-center"
            >
              Xem các câu chuyện cựu SV
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
