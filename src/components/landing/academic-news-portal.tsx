"use client";

import {
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  MapPin,
  Newspaper,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Reveal } from "@/components/motion/reveal";
import { SectionTitle } from "@/components/shared/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  sampleDLUEvents,
  sampleDLUExperiences,
  sampleDLUJobs,
} from "@/lib/dlu-sample-data";
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
    if (posts && posts.length > 0) {
      return posts.slice(0, 3).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: stripHtml(p.content || ""),
        date: new Date(p.publishedAt || p.createdAt).toLocaleDateString(
          "vi-VN",
        ),
        imageUrl:
          p.coverImageUrl ||
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
        href: `/experiences/${p.id}`,
        tag:
          ((p.tags as string[]) || ["CHIA SẺ"])[0]?.toUpperCase() || "CHIA SẺ",
      }));
    }

    return [
      {
        id: "dlu-news-1",
        title:
          "CHƯƠNG TRÌNH ĐỊNH HƯỚNG NGHỀ NGHIỆP VÀ KẾT NỐI DOANH NGHIỆP TRƯỜNG ĐẠI HỌC ĐÀ LẠT",
        description:
          "Mạng lưới Cựu sinh viên phối hợp cùng Ban Giám hiệu Trường Đại học Đà Lạt tổ chức chuỗi sự kiện giao lưu, trang bị kỹ năng thực chiến cho sinh viên các khoa trước thềm tốt nghiệp.",
        date: "10/09/2026",
        imageUrl:
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
        href: "/experiences",
        tag: "KHOA CNTT",
      },
      {
        id: "dlu-news-2",
        title:
          "BAN LIÊN LẠC MẠNG LƯỚI CỰU SINH VIÊN ĐẠI HỌC ĐÀ LẠT – CẦU NỐI GẮN KẾT CÁC THẾ HỆ",
        description:
          "Tốt nghiệp không phải là kết thúc hành trình, mà là sự tiếp nối một tình yêu sâu đậm với xứ sở ngàn hoa và mái trường Đại học Đà Lạt cổ kính, nên thơ.",
        date: "01/07/2026",
        imageUrl:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
        href: "/experiences",
        tag: "MẠNG LƯỚI",
      },
      {
        id: "dlu-news-3",
        title:
          "NHIỆM VỤ VÀ TẦM NHÌN PHÁT TRIỂN CỦA MẠNG LƯỚI CỰU SINH VIÊN ĐẠI HỌC ĐÀ LẠT ĐẾN 2030",
        description:
          "Khẳng định truyền thống học thuật xuất sắc của DLU, hỗ trợ thế hệ đàn em về học bổng, việc làm và nâng tầm vị thế sinh viên Đà Lạt trên thị trường lao động toàn cầu.",
        date: "24/06/2026",
        imageUrl:
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
        href: "/experiences",
        tag: "CHIẾN LƯỢC",
      },
    ];
  }, [posts]);

  // 2. Sự kiện tiêu điểm DLU
  const leadEvent = React.useMemo(() => {
    if (events && events.length > 0) {
      const ev = events[0];
      return {
        id: ev.id,
        title:
          ev.title ||
          "KẾT NỐI TRUYỀN THỐNG – TIẾP BƯỚC ƯỚC MƠ: DLU HOMECOMING 2026",
        date: new Date(ev.startTime).toLocaleDateString("vi-VN", {
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
        imageUrl:
          ev.coverImageUrl ||
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
        href: `/events/${ev.id}`,
      };
    }
    const sample = sampleDLUEvents[0];
    return {
      id: sample.id,
      title: sample.title,
      date: "08:30 - Ngày 20/11/2026",
      location:
        "Hội trường Thư viện Trung tâm - Trường Đại học Đà Lạt (01 Phù Đổng Thiên Vương, TP. Đà Lạt)",
      imageUrl:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
      href: "/events",
    };
  }, [events]);

  // 3. Việc làm nổi bật (Section 7)
  const displayJobs = React.useMemo(() => {
    const raw = jobs.length > 0 ? jobs : sampleDLUJobs;
    return raw.slice(0, 3);
  }, [jobs]);

  // 4. Gương mặt Cựu sinh viên tiêu biểu (Section 8: 4 cards ảnh đứng)
  const alumniSpotlights = React.useMemo(() => {
    if (spotlightAlumni && spotlightAlumni.length > 0) {
      return spotlightAlumni.slice(0, 4).map((a: any, i: number) => ({
        id: a.userId || a.id || `alumni-${i}`,
        name: a.fullName || a.name,
        role: a.currentTitle ? `${a.currentTitle}${a.currentCompanyName ? ` tại ${a.currentCompanyName}` : ""}` : (a.bio || "Thành viên Ban liên lạc"),
        cohort: a.batchYear ? `Cựu SV K${a.batchYear}` : (a.major || a.faculty || "Cựu SV DLU"),
        quote:
          a.bio ||
          "Đại học Đà Lạt là cái nôi nuôi dưỡng tri thức, nhân cách và tình yêu nghề nghiệp cho bao thế hệ sinh viên.",
        imageUrl:
          a.avatarUrl ||
          `https://images.unsplash.com/photo-${[
            "1534528741775-53994a69daeb",
            "1573496359142-b8d87734a5a2",
            "1507003211169-0a1dd7228f2d",
            "1500648767791-00dcc994a43e",
          ][i % 4]}?auto=format&fit=crop&w=600&q=80`,
        href: `/alumni`,
      }));
    }

    return [
      {
        id: "alumni-1",
        name: "Bùi Đình An",
        role: "Ủy viên Ban liên lạc · Công ty CP Mạnh Đan",
        cohort: "Cựu SV DLU",
        quote:
          "Tự hào là cựu sinh viên Đại học Đà Lạt. Ban liên lạc luôn sẵn sàng đồng hành, kết nối cơ hội phát triển cho các thế hệ đàn em.",
        imageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
        href: "/alumni",
      },
      {
        id: "alumni-2",
        name: "Bùi Thị Thoa",
        role: "Ủy viên Ban liên lạc · Phó Trưởng khoa Quốc tế học",
        cohort: "Cựu SV DLU",
        quote:
          "Mạng lưới cựu sinh viên là cầu nối vững chắc gắn kết giữa Nhà trường, Khoa và các cựu sinh viên trên mọi miền Tổ quốc.",
        imageUrl:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
        href: "/alumni",
      },
      {
        id: "alumni-3",
        name: "Chu Văn Bình",
        role: "Phó trưởng ban BLL Khoa Luật học · Tòa án khu vực 1",
        cohort: "Cựu SV Luật học DLU",
        quote:
          "Những giá trị công lý, tri thức được trui rèn tại giảng đường DLU là kim chỉ nam cho sự nghiệp và cuộc sống.",
        imageUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        href: "/alumni",
      },
      {
        id: "alumni-4",
        name: "Lê Văn Thảo",
        role: "Ủy viên Ban Chấp hành · Viện Kiểm sát Nhân dân tỉnh Lâm Đồng",
        cohort: "Cựu SV Luật học DLU",
        quote:
          "Mỗi chuyến trở về trường cũ là một lần được tiếp thêm nguồn cảm hứng và niềm tin cống hiến cho cộng đồng và quê hương.",
        imageUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        href: "/alumni",
      },
    ];
  }, [spotlightAlumni]);

  return (
    <div className="space-y-0">
      {/* ─── SECTION 5: TIN TỨC & SỰ KIỆN (Nền canvas) ──────────────────── */}
      <section className="w-full bg-canvas py-14 sm:py-18">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="fade">
            <SectionTitle
              title="TIN TỨC & SỰ KIỆN NỔI BẬT"
              subtitle="Cập nhật hoạt động mới nhất từ Khoa CNTT và Mạng lưới Cựu sinh viên Đại học Đà Lạt"
              icon={Newspaper}
              viewAllHref="/experiences"
              viewAllText="Tất cả bản tin"
            />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* CỘT TRÁI: TIN TỨC KHOA & CỰU SV (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {newsList.map((item, idx) => (
                <Reveal key={item.id} index={idx} variant="up">
                  <article className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-border bg-card shadow-brand hover:shadow-brand-lg hover:border-pine-300 transition-all duration-300 group">
                    {/* Thumbnail bên trái */}
                    <div className="sm:w-48 h-32 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted relative">
                      <Image
                        src={item.imageUrl}
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
              ))}
            </div>

            {/* CỘT PHẢI: SỰ KIỆN TIÊU ĐIỂM (5 cols) */}
            <div className="lg:col-span-5">
              <Reveal variant="scale">
                <Card className="rounded-2xl border border-border bg-card shadow-brand overflow-hidden hover:shadow-brand-lg transition-all duration-300 group">
                  {/* Event image with badge */}
                  <div
                    data-slot="card-image"
                    className="relative aspect-[16/10] w-full overflow-hidden bg-muted"
                  >
                    <Image
                      src={leadEvent.imageUrl}
                      alt={leadEvent.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 500px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 bg-pine-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-center font-mono">
                      <span className="block text-base font-bold leading-tight">
                        20
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-gold-300">
                        THÁNG 11
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayJobs.map((job, idx) => {
              const companyName =
                job.company?.name || job.companyName || "Tập đoàn Đối tác DLU";
              const title = job.title || "Kỹ sư phần mềm Fullstack";
              const location = job.location || "TP. Đà Lạt / Hybrid";
              const salary =
                job.salaryMin && job.salaryMax
                  ? `${job.salaryMin} - ${job.salaryMax} triệu`
                  : "Thỏa thuận hấp dẫn";
              const deadline = job.deadline
                ? new Date(job.deadline).toLocaleDateString("vi-VN")
                : "Còn 15 ngày";
              const skills = job.skills || ["React", "TypeScript", "Node.js"];

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
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-4 border-t border-border/60 mt-4 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        Toàn thời gian
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
              viewAllHref="/experiences"
              viewAllText="Tất cả bài viết"
            />
          </Reveal>

          {/* 4 Portrait Cards (4:5 Ratio) with Newsreader Serif Quotes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {alumniSpotlights.map((alumni, idx) => (
              <Reveal key={alumni.id} index={idx} variant="up">
                <Card className="rounded-2xl pt-0 border border-border bg-white overflow-hidden shadow-brand hover:shadow-brand-lg hover:border-pine-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full">
                  <div>
                    {/* Portrait Image (4:5 Ratio) */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                      <Image
                        src={alumni.imageUrl}
                        alt={alumni.name}
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
        </div>
      </section>
    </div>
  );
};
