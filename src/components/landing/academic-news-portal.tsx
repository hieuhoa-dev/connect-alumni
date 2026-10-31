"use client";

import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  Newspaper,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { ContentImage } from "@/components/shared/content-image";
import { Reveal } from "@/components/motion/reveal";
import { SectionTitle } from "@/components/shared/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { stripHtml } from "@/lib/utils";

interface AcademicNewsPortalProps {
  events?: any[];
  posts?: any[];
  jobs?: any[];
  scholarships?: any[];
  spotlightAlumni?: any[];
}

export const AcademicNewsPortal = ({
  events = [],
  posts = [],
  jobs = [],
  scholarships = [],
  spotlightAlumni = [],
}: AcademicNewsPortalProps) => {
  // 1. Dữ liệu Tin tức Cựu sinh viên Đại học Đà Lạt
  const newsList = React.useMemo(() => {
    if (!posts || posts.length === 0) return [];

    return posts.slice(0, 3).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: stripHtml(p.content || ""),
      date: new Date(p.publishedAt || p.createdAt).toLocaleDateString("vi-VN"),
      imageUrl: p.coverImageUrl || "/placeholder-cover.svg",
      href: `/experiences/${p.id}`,
      tag:
        ((p.tags as string[]) || ["CHIA SẺ"])[0]?.toUpperCase() || "CHIA SẺ",
    }));
  }, [posts]);

  // 2. Sự kiện tiêu điểm DLU
  const leadEvent = React.useMemo(() => {
    if (!events || events.length === 0) return null;

    const ev = events[0];
    const eventDate = new Date(ev.startTime);
    return {
      id: ev.id,
      title: ev.title || "Sự kiện kết nối Cựu sinh viên DLU",
      day: eventDate.getDate(),
      monthText: `THÁNG ${eventDate.getMonth() + 1}`,
      date: eventDate.toLocaleDateString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      location:
        ev.locationOrLink && ev.locationOrLink !== "undefined"
          ? ev.locationOrLink
          : "Hội trường Thư viện Trung tâm - Trường Đại học Đà Lạt",
      imageUrl: ev.coverImageUrl || "/placeholder-cover.svg",
      href: `/events/${ev.id}`,
    };
  }, [events]);

  // 3. Việc làm nổi bật (Section 7)
  const displayJobs = React.useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    return jobs.slice(0, 3);
  }, [jobs]);

  // 4. Gương mặt Cựu sinh viên tiêu biểu (Section 8: 4 cards ảnh đứng)
  const alumniSpotlights = React.useMemo(() => {
    if (!spotlightAlumni || spotlightAlumni.length === 0) return [];

    return spotlightAlumni.slice(0, 4).map((a: any, i: number) => ({
      id: a.userId || a.id || `alumni-${i}`,
      name: a.fullName || a.name || "Cựu sinh viên DLU",
      role: a.currentTitle
        ? `${a.currentTitle}${a.currentCompanyName ? ` tại ${a.currentCompanyName}` : ""}`
        : a.bio || "Thành viên Ban liên lạc",
      cohort: a.batchYear
        ? `Cựu SV K${a.batchYear}`
        : a.major || a.faculty || "Cựu SV DLU",
      quote:
        a.bio ||
        "Đại học Đà Lạt là cái nôi nuôi dưỡng tri thức, nhân cách và tình yêu nghề nghiệp cho bao thế hệ sinh viên.",
      imageUrl: a.avatarUrl || "/placeholder-avatar.svg",
      href: `/alumni`,
    }));
  }, [spotlightAlumni]);

  return (
    <div className="space-y-0">
      {/* ─── SECTION 5: TIN TỨC & SỰ KIỆN (Nền canvas) ──────────────────── */}
      <section className="w-full bg-canvas py-14 sm:py-18">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="fade">
            <SectionTitle
              title="TIN TỨC &amp; SỰ KIỆN NỔI BẬT"
              subtitle="Cập nhật hoạt động mới nhất từ Khoa CNTT và Mạng lưới Cựu sinh viên Đại học Đà Lạt"
              icon={Newspaper}
              viewAllHref="/experiences"
              viewAllText="Tất cả bản tin"
            />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* CỘT TRÁI: TIN TỨC KHOA & CỰU SV (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {newsList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card">
                  <p className="text-sm text-muted-foreground">
                    Hiện chưa có bài chia sẻ hoặc tin tức mới được công bố.
                  </p>
                  <Button
                    render={<Link href="/experiences" />}
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    className="mt-3 text-xs"
                  >
                    Xem góc chia sẻ kinh nghiệm
                  </Button>
                </div>
              ) : (
                newsList.map((item, idx) => (
                  <Reveal key={item.id} index={idx} variant="up">
                    <article className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-border bg-card shadow-brand hover:shadow-brand-lg hover:border-pine-300 transition-all duration-300 group">
                      {/* Thumbnail bên trái */}
                      <div className="sm:w-48 h-32 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted relative">
                        <ContentImage
                          file={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 192px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      {/* Nội dung tin */}
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-pine-800 bg-pine-100 px-2 py-0.5 rounded-full uppercase">
                              {item.tag}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {item.date}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2 uppercase group-hover:text-primary transition-colors mt-1.5">
                            <Link href={item.href}>{item.title}</Link>
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1 font-sans">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <Link
                            href={item.href}
                            className="font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                          >
                            <span>Xem chi tiết</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))
              )}
            </div>

            {/* CỘT PHẢI: SỰ KIỆN TIÊU ĐIỂM (5 cols) */}
            <div className="lg:col-span-5">
              {!leadEvent ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card">
                  <Calendar className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-semibold text-foreground">
                    Chưa có sự kiện nào sắp diễn ra
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Theo dõi lịch hội thảo, talkshow tiếp theo từ Nhà trường.
                  </p>
                  <Button
                    render={<Link href="/events" />}
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    className="mt-3 text-xs"
                  >
                    Xem danh sách sự kiện
                  </Button>
                </div>
              ) : (
                <Reveal variant="scale">
                  <Card className="rounded-2xl border border-border bg-card shadow-brand overflow-hidden hover:shadow-brand-lg transition-all duration-300 group">
                    {/* Event image with badge */}
                    <div
                      data-slot="card-image"
                      className="relative aspect-[16/10] w-full overflow-hidden bg-muted"
                    >
                      <ContentImage
                        file={leadEvent.imageUrl}
                        alt={leadEvent.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 500px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 bg-pine-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-center font-mono">
                        <span className="block text-base font-bold leading-tight">
                          {leadEvent.day}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-gold-300">
                          {leadEvent.monthText}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="hot" className="shadow-xs">
                          SẮP DIỄN RA
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug uppercase group-hover:text-primary transition-colors">
                        <Link href={leadEvent.href}>{leadEvent.title}</Link>
                      </h3>

                      <div className="space-y-2 text-xs text-muted-foreground font-sans">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-sun-600 shrink-0" />
                          <span>Thời gian: {leadEvent.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 text-sun-600 shrink-0" />
                          <span className="line-clamp-1">
                            Địa điểm: {leadEvent.location}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          render={<Link href={leadEvent.href} />}
                          nativeButton={false}
                          variant="default"
                          size="default"
                          className="w-full text-xs font-bold uppercase tracking-wider h-10 shadow-xs"
                        >
                          Đăng ký tham gia sự kiện
                          <ArrowRight className="size-3.5 ml-1.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: VIỆC LÀM NỔI BẬT (Nền pine-50) ─────────────────── */}
      <section className="w-full bg-pine-50/70 py-14 sm:py-18 border-y border-pine-200/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="fade">
            <SectionTitle
              title="CƠ HỘI NGHỀ NGHIỆP DLU"
              subtitle="Các vị trí tuyển dụng chính quy được thẩm định từ Doanh nghiệp đối tác và Cựu sinh viên"
              icon={Briefcase}
              badge="XÁC THỰC"
              viewAllHref="/jobs"
              viewAllText="Xem tất cả việc làm"
            />
          </Reveal>

          {displayJobs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-white">
              <p className="text-sm text-muted-foreground">
                Hiện chưa có tin tuyển dụng nào đang mở.
              </p>
              <Button
                render={<Link href="/jobs" />}
                nativeButton={false}
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
              >
                Khám phá cổng việc làm
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayJobs.map((job, idx) => {
                const companyName =
                  job.company?.name || job.companyName || "Đối tác DLU";
                const title = job.title || "Vị trí tuyển dụng";
                const location = job.location || "Đà Lạt / Toàn quốc";
                const salary =
                  job.salaryRange ||
                  (job.salaryMin && job.salaryMax
                    ? `${job.salaryMin} - ${job.salaryMax} triệu`
                    : "Thỏa thuận");
                const deadline = job.expiresAt
                  ? new Date(job.expiresAt).toLocaleDateString("vi-VN")
                  : "Đang mở";
                const skills = job.skills || [];

                return (
                  <Reveal key={job.id || idx} index={idx} variant="up">
                    <Card className="rounded-2xl border border-border bg-white p-5 shadow-brand hover:shadow-brand-lg hover:border-pine-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group">
                      <div className="space-y-4">
                        {/* Company Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-pine-50 border border-pine-200 text-pine-800 font-bold font-mono text-sm shrink-0">
                              {companyName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-muted-foreground line-clamp-1">
                                {companyName}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge variant="success" className="text-[10px]">
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Verified
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <Badge variant="hot" className="text-[10px]">
                            {deadline}
                          </Badge>
                        </div>

                        {/* Job Title */}
                        <div>
                          <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            <Link href={`/jobs/${job.id}`}>{title}</Link>
                          </h3>
                          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground mt-2">
                            <span className="text-primary font-bold">
                              {salary}
                            </span>
                            <span>•</span>
                            <span>{location}</span>
                          </div>
                        </div>

                        {/* Skills Chips */}
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {skills.slice(0, 3).map((s: string) => (
                              <span
                                key={s}
                                className="rounded-md bg-pine-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-pine-800 border border-pine-200/50"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom CTA */}
                      <div className="pt-4 border-t border-border/60 mt-4 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {job.jobType === "internship"
                            ? "Thực tập"
                            : job.jobType === "part_time"
                              ? "Bán thời gian"
                              : "Toàn thời gian"}
                        </span>
                        <Button
                          render={<Link href={`/jobs/${job.id}`} />}
                          nativeButton={false}
                          variant="default"
                          size="sm"
                          className="text-xs font-semibold"
                        >
                          Ứng tuyển ngay
                        </Button>
                      </div>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── SECTION 8: CỰU SINH VIÊN TIÊU BIỂU (Nền canvas) ─────────────── */}
      <section className="w-full bg-canvas py-14 sm:py-18">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="fade">
            <SectionTitle
              title="GƯƠNG MẶT CỰU SINH VIÊN ĐẠI HỌC ĐÀ LẠT"
              subtitle="Những câu chuyện truyền cảm hứng và hành trình khởi nghiệp, cống hiến của cựu sinh viên DLU"
              icon={GraduationCap}
              viewAllHref="/alumni"
              viewAllText="Mạng lưới cựu sinh viên"
            />
          </Reveal>

          {alumniSpotlights.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-white">
              <p className="text-sm text-muted-foreground">
                Đang cập nhật danh sách gương mặt cựu sinh viên tiêu biểu.
              </p>
              <Button
                render={<Link href="/alumni" />}
                nativeButton={false}
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
              >
                Khám phá mạng lưới cựu sinh viên
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {alumniSpotlights.map((alumni, idx) => (
                <Reveal key={alumni.id} index={idx} variant="up">
                  <Card className="rounded-2xl pt-0 border border-border bg-white overflow-hidden shadow-brand hover:shadow-brand-lg hover:border-pine-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full">
                    <div>
                      {/* Portrait Image (4:5 Ratio) */}
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                        <ContentImage
                          file={alumni.imageUrl}
                          alt={alumni.name}
                          fallbackType="avatar"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Name & Cohort overlaid on image bottom */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <span className="font-mono text-[10px] font-bold text-gold-300 uppercase block tracking-wider">
                            {alumni.cohort}
                          </span>
                          <h3 className="font-sans text-base font-bold leading-tight mt-0.5">
                            {alumni.name}
                          </h3>
                          <p className="text-[11px] text-emerald-100 line-clamp-1 mt-0.5">
                            {alumni.role}
                          </p>
                        </div>
                      </div>

                      {/* Serif Quote */}
                      <div className="p-4 space-y-2">
                        <p className="font-serif italic text-xs sm:text-sm text-foreground/90 line-clamp-4 leading-relaxed">
                          “{alumni.quote}”
                        </p>
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-1 flex justify-end">
                      <Link
                        href={alumni.href}
                        className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Đọc chia sẻ</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
