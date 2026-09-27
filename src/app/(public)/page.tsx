import * as React from "react";
import Link from "next/link";
import { getActiveJobPosts } from "@/actions/job-actions";
import { getPublishedEvents } from "@/actions/event-actions";
import { getPublishedExperiencePosts } from "@/actions/experience-actions";
import { getScholarshipCampaigns } from "@/actions/scholarship-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  Briefcase,
  Calendar,
  BookOpen,
  HeartHandshake,
  ArrowRight,
  MapPin,
  Clock,
  Building2,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { cn } from "cn";

export const revalidate = 60; // ISR cache 60s

const HomePage = async () => {
  const [jobs, events, posts, scholarships] = await Promise.all([
    getActiveJobPosts({ limit: 4 }),
    getPublishedEvents(),
    getPublishedExperiencePosts({ limit: 3 }),
    getScholarshipCampaigns(),
  ]);

  const featuredEvents = events.slice(0, 2);
  const featuredScholarship = scholarships[0];

  return (
    <div className="space-y-20 pb-20">
      {/* ─── HERO SECTION (Editorial Academic) ─────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/70 bg-card/60 py-20 sm:py-28">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#BFDFFA]/60 bg-[#E1F3FE] px-3 py-1 text-xs font-medium text-[#1F6C9F] dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-300">
              <Sparkles className="size-3.5" />
              <span>
                Nền tảng kết nối 4 Bên: Sinh viên – Khoa CNTT – Cựu SV – Doanh
                nghiệp
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-foreground leading-[1.12]">
              Cầu nối Tri thức & Cơ hội{" "}
              <span className="italic block sm:inline font-serif font-light text-foreground/85">
                Khoa Công nghệ Thông tin
              </span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Truy cập cơ hội việc làm xác thực từ mạng lưới đối tác, tham gia
              các buổi talkshow định hướng cùng cựu sinh viên và tiếp sức tương
              lai cùng Quỹ Khuyến học Khoa CNTT.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button
                render={<Link href="/jobs" />}
                nativeButton={false}
                size="lg"
                className="font-medium"
              >
                <Briefcase data-icon="inline-start" />
                Khám phá việc làm
              </Button>
              <Button
                render={<Link href="/events" />}
                nativeButton={false}
                variant="outline"
                size="lg"
              >
                <Calendar data-icon="inline-start" />
                Sự kiện & Talkshow
              </Button>
              <Button
                render={<Link href="/scholarships" />}
                nativeButton={false}
                variant="ghost"
                size="lg"
              >
                <HeartHandshake data-icon="inline-start" />
                Quỹ Khuyến học
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar (Geist Mono) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-border/60">
            <div className="flex flex-col items-center p-4 rounded-xl bg-background border border-border/70">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                100%
              </span>
              <span className="text-xs text-muted-foreground mt-1 text-center font-medium">
                Doanh nghiệp qua kiểm duyệt
              </span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-background border border-border/70">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                50+
              </span>
              <span className="text-xs text-muted-foreground mt-1 text-center font-medium">
                Đối tác công nghệ hàng đầu
              </span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-background border border-border/70">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                3,000+
              </span>
              <span className="text-xs text-muted-foreground mt-1 text-center font-medium">
                Mạng lưới cựu sinh viên
              </span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-background border border-border/70">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                500M+
              </span>
              <span className="text-xs text-muted-foreground mt-1 text-center font-medium">
                Quỹ học bổng kết nối
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED JOBS ────────────────────────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Briefcase className="size-3.5" />
              <span>Cơ hội nghề nghiệp</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground mt-1">
              Tin tuyển dụng mới nhất
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Được các đối tác doanh nghiệp đăng tải và Khoa xác minh bảo đảm
            </p>
          </div>
          <Button
            render={<Link href="/jobs" />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            Xem tất cả việc làm <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
              Hiện tại chưa có tin tuyển dụng nào đang mở.
            </div>
          ) : (
            jobs.map((job) => (
              <Card
                key={job.id}
                className="border border-border/80 hover:border-foreground/20 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold leading-snug hover:text-primary transition-colors">
                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-1 font-medium text-xs text-foreground">
                        <Building2 className="size-3.5 text-muted-foreground" />
                        {job.company?.name}
                      </CardDescription>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {job.jobType.replace("_", " ")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 text-xs text-muted-foreground space-y-2">
                  <p className="line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {job.location}
                    </span>
                    {job.salaryRange && (
                      <span className="font-mono font-medium text-foreground">
                        {job.salaryRange}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-3 text-[11px] text-muted-foreground flex justify-between items-center border-t border-border/50">
                  <span className="font-mono">
                    Hạn nộp:{" "}
                    {new Date(job.expiresAt).toLocaleDateString("vi-VN")}
                  </span>
                  <Button
                    render={<Link href={`/jobs/${job.id}`} />}
                    nativeButton={false}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-medium"
                  >
                    Chi tiết
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* ─── UPCOMING EVENTS & TALKSHOWS ──────────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>Talkshow & Hội thảo</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground mt-1">
              Sự kiện sắp diễn ra
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Gặp gỡ và trao đổi trực tiếp cùng các cựu sinh viên tiêu biểu
            </p>
          </div>
          <Button
            render={<Link href="/events" />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            Lịch toàn bộ sự kiện <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredEvents.map((event) => (
            <Card
              key={event.id}
              className="group relative flex aspect-[4/3] w-full flex-col justify-end overflow-hidden rounded-[26px] border-0 p-5 shadow-sm transition-all duration-300 hover:shadow-xl"
            >
              {/* 1. Lớp ảnh nền bao phủ tuyệt đối (không chiếm luồng layout) */}
              {event.coverImageUrl ? (
                <img
                  src={event.coverImageUrl}
                  alt={event.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-zinc-950">
                  <CalendarDays className="size-16 text-white/10" />
                </div>
              )}

              {/* Lớp gradient làm tối để nổi bật chữ & badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/30 pointer-events-none" />

              {/* 2. Cố định Badge ở góc trên bên trái (luôn cố định vị trí dù có hay không có ảnh) */}
              <div className="absolute left-4 top-4 z-20 flex items-center gap-1.5">
                <span className="rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white shadow-sm">
                  {event.type}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white shadow-sm backdrop-blur-md border border-white/15",
                    event.format === "online"
                      ? "bg-blue-600/80"
                      : "bg-emerald-600/80",
                  )}
                >
                  {event.format === "online" ? "Trực tuyến" : "Trực tiếp"}
                </span>
              </div>

              {/* 3. Khối nội dung đáy */}
              <div className="relative z-10 space-y-3 text-white">
                <div>
                  <h3 className="line-clamp-2 text-lg font-bold leading-snug drop-shadow-sm">
                    <Link
                      href={`/events/${event.id}`}
                      className="hover:underline"
                    >
                      {event.title}
                    </Link>
                  </h3>
                  <p className="mt-1 line-clamp-2 break-all text-xs text-white/80 leading-relaxed">
                    {event.description || "Không có mô tả chi tiết."}
                  </p>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-[11px] text-white/85">
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Clock className="size-3.5 text-white/70" />
                    <span className="font-mono">
                      {new Date(event.startTime).toLocaleDateString("vi-VN", {
                        dateStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0 text-white/70" />
                    <span className="truncate">
                      {event.locationOrLink || "Chưa cập nhật địa điểm"}
                    </span>
                  </div>
                </div>

                {/* Nút đăng ký */}
                <Button
                  render={<Link href={`/events/${event.id}`} />}
                  nativeButton={false}
                  className="w-full h-9 rounded-full bg-white font-medium text-neutral-900 shadow-sm transition hover:bg-white/90 active:scale-[0.98]"
                >
                  Đăng ký tham gia ({event.registrations.length})
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── SCHOLARSHIP FUND BANNER ─────────────────────────────────────── */}
      {featuredScholarship && (
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-[#BFDFFA]/60 bg-[#E1F3FE] px-2.5 py-0.5 text-[11px] font-medium text-[#1F6C9F] dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-300">
                Quỹ Khuyến học Khoa CNTT
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
                {featuredScholarship.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {featuredScholarship.description}
              </p>
              <div className="flex items-center gap-6 pt-2 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">Mục tiêu: </span>
                  <span className="font-bold text-foreground">
                    {Number(featuredScholarship.targetAmount).toLocaleString(
                      "vi-VN",
                    )}{" "}
                    đ
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Đã tiếp nhận: </span>
                  <span className="font-bold text-foreground">
                    {Number(featuredScholarship.currentAmount).toLocaleString(
                      "vi-VN",
                    )}{" "}
                    đ
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button
                render={
                  <Link href={`/scholarships/${featuredScholarship.id}`} />
                }
                nativeButton={false}
                size="lg"
              >
                Nộp hồ sơ xin học bổng
              </Button>
              <Button
                render={<Link href="/employer/scholarships/pledge" />}
                nativeButton={false}
                variant="outline"
                size="lg"
              >
                Đồng hành & Tài trợ
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─── ALUMNI EXPERIENCE SHARING ───────────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="size-3.5" />
              <span>Góc chia sẻ kinh nghiệm</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground mt-1">
              Bài viết từ Cựu sinh viên
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Bài học thực chiến, định hướng phỏng vấn và phát triển sự nghiệp
            </p>
          </div>
          <Button
            render={<Link href="/experiences" />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            Xem tất cả bài viết <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="flex flex-col justify-between border border-border/80 hover:border-foreground/20 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <CardTitle className="text-base font-semibold leading-snug line-clamp-2">
                  <Link href={`/experiences/${post.id}`}>{post.title}</Link>
                </CardTitle>
                <CardDescription className="text-[11px] mt-1">
                  Bởi{" "}
                  <span className="font-medium text-foreground">
                    {post.author?.profile?.fullName || post.author?.name}
                  </span>
                  {post.author?.profile?.bio &&
                    ` · ${post.author?.profile?.bio}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground line-clamp-3 pb-3 leading-relaxed">
                {post.content}
              </CardContent>
              <CardFooter className="text-[11px] text-muted-foreground flex justify-between items-center border-t border-border/50 pt-3">
                <span className="font-mono">
                  {new Date(
                    post.publishedAt || post.createdAt,
                  ).toLocaleDateString("vi-VN")}
                </span>
                <Link
                  href={`/experiences/${post.id}`}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "h-7 text-xs font-medium",
                  })}
                >
                  Đọc tiếp
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── PARTNER LOGOS ───────────────────────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="rounded-xl border border-border/70 bg-card p-8 text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Được đồng hành bởi các Doanh nghiệp & Tập đoàn Công nghệ Hàng đầu
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-80 transition-all duration-300">
            <span className="font-mono text-base font-semibold tracking-tight text-foreground">
              VNG Corporation
            </span>
            <span className="font-mono text-base font-semibold tracking-tight text-foreground">
              FPT Software
            </span>
            <span className="font-mono text-base font-semibold tracking-tight text-foreground">
              Viettel Group
            </span>
            <span className="font-mono text-base font-semibold tracking-tight text-foreground">
              VNPT IT
            </span>
            <span className="font-mono text-base font-semibold tracking-tight text-foreground">
              MoMo Fintech
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
