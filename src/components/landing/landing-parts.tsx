import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Eye,
  HeartHandshake,
  MapPin,
  TrendingUp,
  Video,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingImage } from "@/components/landing/landing-image";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import type {
  LandingCampaign,
  LandingEvent,
  LandingJob,
  LandingPartner,
  LandingPopularPost,
  LandingPost,
  LandingStats,
} from "@/lib/public-data";
import {
  EVENT_TYPE_LABEL,
  formatDateVi,
  formatNumberVi,
  formatTimeVi,
  formatVndCompact,
  getInitials,
  JOB_TYPE_LABEL,
} from "@/lib/text";
import { cn } from "@/lib/utils";

/* ─── Nhãn pastel (đúng bảng màu trong DESIGN.md) ───────────────────────── */

type TagTone = "blue" | "green" | "yellow" | "red" | "slate";

const TAG_TONE: Record<TagTone, string> = {
  blue: "border-[#BFDFFA]/60 bg-[#E1F3FE] text-[#1F6C9F] dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-300",
  green:
    "border-[#CDE3CB]/60 bg-[#EDF3EC] text-[#346538] dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300",
  yellow:
    "border-[#EBD9A0]/60 bg-[#FBF3DB] text-[#956400] dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300",
  red: "border-[#F5C2C4]/60 bg-[#FDEBEC] text-[#9F2F2D] dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300",
  slate:
    "border-border bg-[#F1F1EF] text-[#444441] dark:bg-muted dark:text-muted-foreground",
};

export const Tag = ({
  tone = "slate",
  className,
  children,
}: {
  tone?: TagTone;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider",
        TAG_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
};

/* ─── Ảnh có fallback ───────────────────────────────────────────────────── */

export const CoverImage = ({
  src,
  alt,
  icon: Icon,
  className,
}: {
  src: string | null;
  alt: string;
  icon: LucideIcon;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border-strong bg-card",
        className,
      )}
    >
      <LandingImage
        src={src}
        alt={alt}
        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        fallback={
          <div className="flex size-full items-center justify-center text-muted-foreground/40">
            <Icon className="size-10" />
          </div>
        }
      />
    </div>
  );
};

/* ─── Tiêu đề khối: vạch kẻ trên đậm như mục báo in ─────────────────────── */

export const SectionHeading = ({
  icon: Icon,
  eyebrow,
  title,
  href,
  hrefLabel = "Xem tất cả",
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) => {
  return (
    <div className="flex items-end justify-between gap-4 border-t-2 border-foreground pt-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className="size-3.5" />
          <span>{eyebrow}</span>
        </div>
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
      </div>
      {href && (
        <Button
          render={<Link href={href} />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="shrink-0"
        >
          {hrefLabel}
          <ArrowRight data-icon="inline-end" />
        </Button>
      )}
    </div>
  );
};

export const EmptyBlock = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) => {
  return (
    <Empty className="border border-border-strong">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

/* ─── Dòng thông tin tác giả / ngày / lượt xem ──────────────────────────── */

const PostMeta = ({
  post,
  className,
}: {
  post: Pick<
    LandingPost,
    "authorName" | "authorBatch" | "publishedAt" | "viewCount"
  >;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="font-medium text-foreground">
        {post.authorName}
        {post.authorBatch ? (
          <span className="font-normal text-muted-foreground">
            {" "}
            · K{post.authorBatch}
          </span>
        ) : null}
      </span>
      {post.publishedAt && (
        <time
          dateTime={new Date(post.publishedAt).toISOString()}
          className="font-mono"
        >
          {formatDateVi(post.publishedAt)}
        </time>
      )}
      <span className="flex items-center gap-1 font-mono">
        <Eye className="size-3" />
        {formatNumberVi(post.viewCount)}
      </span>
    </div>
  );
};

/* ─── Mở đầu trang: tên báo + chuyên mục ────────────────────────────────── */

export const Masthead = () => <LandingHero />;

export const LeadStory = ({ post }: { post: LandingPost | undefined }) => {
  if (!post) {
    return (
      <EmptyBlock
        icon={BookOpen}
        title="Chưa có tin nào được đăng"
        description="Thông báo của Khoa và bài chia sẻ của cựu sinh viên sẽ hiển thị tại đây sau khi được đăng."
      />
    );
  }

  return (
    <article className="group relative flex flex-col gap-4">
      <CoverImage
        src={post.coverImageUrl}
        alt={post.title}
        icon={BookOpen}
        className={post.coverImageUrl ? "aspect-[16/9]" : "aspect-[21/8]"}
      />
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag tone="blue">{post.isPinned ? "Tin nổi bật" : "Mới nhất"}</Tag>
          {post.tags.slice(0, 2).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <h2 className="font-serif text-3xl font-medium leading-[1.15] tracking-tight text-foreground sm:text-4xl">
          <Link
            href={post.href}
            className="underline-offset-4 decoration-1 group-hover:underline after:absolute after:inset-0"
          >
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        <PostMeta post={post} />
      </div>
    </article>
  );
};

export const LatestHeadlines = ({ posts }: { posts: LandingPost[] }) => {
  return (
    <aside aria-label="Tin mới" className="flex flex-col gap-1">
      <div className="flex items-center justify-between border-b border-border-strong pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Tin mới đăng
        </h3>
        <Link
          href="/news"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Xem thêm
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">
          Chưa có thêm bài viết nào.
        </p>
      ) : (
        <ul className="flex flex-col">
          {posts.map((post) => (
            <li
              key={post.id}
              className="group relative flex flex-col gap-1.5 border-b border-border-strong py-4 last:border-b-0"
            >
              {post.tags[0] && (
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {post.tags[0]}
                </span>
              )}
              <h4 className="font-serif text-lg font-medium leading-snug tracking-tight text-foreground">
                <Link
                  href={post.href}
                  className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
                >
                  {post.title}
                </Link>
              </h4>
              <PostMeta post={post} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

/* ─── Số liệu thật từ cơ sở dữ liệu ─────────────────────────────────────── */

export const StatsStrip = ({ stats }: { stats: LandingStats }) => {
  const items = [
    {
      value: formatNumberVi(stats.alumni),
      label: "Cựu sinh viên trong mạng lưới",
    },
    {
      value: formatNumberVi(stats.partners),
      label: "Doanh nghiệp đã xác minh",
    },
    {
      value: formatNumberVi(stats.events),
      label: "Sự kiện đã và đang tổ chức",
    },
    {
      value: formatVndCompact(stats.fundReceived),
      label: "Quỹ Khuyến học đã tiếp nhận",
    },
  ];

  return (
    <section
      aria-label="Số liệu mạng lưới"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-2 bg-card p-5 sm:p-6"
        >
          <span className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {item.value}
          </span>
          <span className="max-w-[24ch] text-xs leading-relaxed text-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </section>
  );
};

/* ─── Bài chia sẻ dạng thẻ ──────────────────────────────────────────────── */

export const StoryGrid = ({ posts }: { posts: LandingPost[] }) => {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <article key={post.id} className="group relative flex flex-col gap-3">
          <CoverImage
            src={post.coverImageUrl}
            alt={post.title}
            icon={BookOpen}
            className="aspect-[16/10]"
          />
          <div className="flex flex-col gap-2">
            {post.tags[0] ? (
              <Tag>{post.tags[0]}</Tag>
            ) : (
              <Tag tone="slate">Chia sẻ</Tag>
            )}
            <h3 className="line-clamp-3 font-serif text-xl font-medium leading-snug tracking-tight text-foreground">
              <Link
                href={post.href}
                className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
              >
                {post.title}
              </Link>
            </h3>
            <PostMeta post={post} />
          </div>
        </article>
      ))}
    </div>
  );
};

/* ─── Sự kiện: khối ngày + thông tin + trạng thái đăng ký ───────────────── */

export const EventList = ({ events }: { events: LandingEvent[] }) => {
  if (events.length === 0) {
    return (
      <EmptyBlock
        icon={Calendar}
        title="Chưa có sự kiện sắp diễn ra"
        description="Lịch talkshow, workshop và ngày hội việc làm mới sẽ được cập nhật tại đây."
      />
    );
  }

  return (
    <ul className="flex flex-col">
      {events.map((event) => {
        const isFull =
          event.capacity !== null && event.registrationCount >= event.capacity;
        const isOnline = event.format === "online";
        const LocationIcon = isOnline ? Video : MapPin;

        return (
          <li
            key={event.id}
            className="group relative flex gap-4 border-b border-border-strong py-5 first:pt-4 last:border-b-0"
          >
            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-[#D5E7F0] bg-[#E1F3FE] text-[#1F6C9F] dark:border-[#354A54] dark:bg-[#233540] dark:text-[#B7E4FB]">
              <span className="font-mono text-xl font-semibold leading-none">
                {formatDateVi(event.startTime, { day: "2-digit" })}
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wider opacity-75">
                Th{formatDateVi(event.startTime, { month: "numeric" })}
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag tone="blue">
                  {EVENT_TYPE_LABEL[event.type] ?? "Sự kiện"}
                </Tag>
                <Tag tone={isOnline ? "slate" : "green"}>
                  {isOnline ? "Trực tuyến" : "Trực tiếp"}
                </Tag>
                {isFull && <Tag tone="red">Đã đủ chỗ</Tag>}
              </div>
              <h3 className="font-serif text-xl font-medium leading-snug tracking-tight text-foreground">
                <Link
                  href={`/events/${event.id}`}
                  className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
                >
                  {event.title}
                </Link>
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-mono">
                  <Clock className="size-3.5" />
                  {formatTimeVi(event.startTime)} –{" "}
                  {formatTimeVi(event.endTime)}
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <LocationIcon className="size-3.5 shrink-0" />
                  <span className="truncate">{event.locationOrLink}</span>
                </span>
                <span className="font-mono">
                  {formatNumberVi(event.registrationCount)}
                  {event.capacity ? ` / ${formatNumberVi(event.capacity)}` : ""}{" "}
                  đăng ký
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

/* ─── Sidebar: việc làm, quỹ, xem nhiều ─────────────────────────────────── */

export const JobList = ({ jobs }: { jobs: LandingJob[] }) => {
  if (jobs.length === 0) {
    return (
      <EmptyBlock
        icon={Briefcase}
        title="Chưa có tin tuyển dụng đang mở"
        description="Tin mới của doanh nghiệp sẽ xuất hiện sau khi Khoa duyệt."
      />
    );
  }

  return (
    <ul className="flex flex-col">
      {jobs.map((job) => (
        <li
          key={job.id}
          className="group relative flex gap-3 border-b border-border-strong py-4 first:pt-3 last:border-b-0"
        >
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-strong bg-card text-[11px] font-semibold text-muted-foreground">
            <LandingImage
              src={job.companyLogoUrl}
              alt={job.companyName}
              className="size-full object-contain"
              fallback={
                <span title={job.companyName}>
                  {getInitials(job.companyName)}
                </span>
              }
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              <Link
                href={`/jobs/${job.id}`}
                className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
              >
                {job.title}
              </Link>
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="size-3 shrink-0" />
              <span className="truncate">{job.companyName}</span>
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
              <Tag tone="green">
                {JOB_TYPE_LABEL[job.jobType] ?? job.jobType}
              </Tag>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="size-3" />
                {job.location}
              </span>
              {job.salaryRange && (
                <span className="font-mono text-[11px] font-medium text-foreground">
                  {job.salaryRange}
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export const FundCard = ({
  campaign,
}: {
  campaign: LandingCampaign | null;
}) => {
  if (!campaign) {
    return (
      <EmptyBlock
        icon={HeartHandshake}
        title="Chưa có chiến dịch đang mở"
        description="Khi Khoa mở chiến dịch học bổng mới, tiến độ gây quỹ sẽ hiển thị tại đây."
      />
    );
  }

  const percent = Math.min(
    100,
    Math.round((campaign.currentAmount / (campaign.targetAmount || 1)) * 100),
  );

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#DCE8D8] bg-[#F1F6EE] p-5 dark:border-emerald-900/40 dark:bg-[#20291F]">
      <Tag tone="green">Quỹ Khuyến học Khoa CNTT</Tag>
      <div className="flex flex-col gap-2">
        <h3 className="font-serif text-xl font-medium leading-snug tracking-tight text-foreground">
          {campaign.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {campaign.description}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Progress
          value={percent}
          aria-label="Tiến độ gây quỹ"
          className="[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-foreground/10"
        />
        <div className="flex items-baseline justify-between font-mono text-xs">
          <span className="font-semibold text-foreground">
            {formatVndCompact(campaign.currentAmount)}
          </span>
          <span className="text-muted-foreground">
            {percent}% / {formatVndCompact(campaign.targetAmount)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Hạn nộp hồ sơ:{" "}
          <span className="font-mono">
            {formatDateVi(campaign.applicationDeadline)}
          </span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          render={<Link href={`/scholarships/${campaign.id}`} />}
          nativeButton={false}
        >
          Xem chiến dịch
          <ArrowRight data-icon="inline-end" />
        </Button>
        <Button
          render={<Link href="/employer/scholarships/pledge" />}
          nativeButton={false}
          variant="outline"
        >
          Đồng hành tài trợ
        </Button>
      </div>
    </div>
  );
};

export const PopularList = ({ posts }: { posts: LandingPopularPost[] }) => {
  if (posts.length === 0) return null;

  return (
    <ol className="flex flex-col">
      {posts.map((post, index) => (
        <li
          key={post.id}
          className="group relative flex items-start gap-4 border-b border-border-strong py-3.5 first:pt-3 last:border-b-0"
        >
          <span className="w-6 shrink-0 font-serif text-3xl leading-none text-muted-foreground/50">
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
              <Link
                href={post.href}
                className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
              >
                {post.title}
              </Link>
            </h3>
            <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
              <TrendingUp className="size-3" />
              {formatNumberVi(post.viewCount)} lượt xem
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
};

/* ─── Đối tác doanh nghiệp ──────────────────────────────────────────────── */

export const PartnerWall = ({ partners }: { partners: LandingPartner[] }) => {
  if (partners.length === 0) return null;

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border-t border-l border-border-strong sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {partners.map((partner) => (
        <div
          key={partner.id}
          title={partner.name}
          className="flex h-20 items-center justify-center border-r border-b border-border-strong bg-background px-4"
        >
          <LandingImage
            src={partner.logoUrl}
            alt={partner.name}
            className="max-h-9 w-auto max-w-full object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
            fallback={
              <span className="line-clamp-2 text-center text-xs font-semibold text-muted-foreground">
                {partner.name}
              </span>
            }
          />
        </div>
      ))}
    </div>
  );
};

/* ─── Kêu gọi tham gia theo vai trò ─────────────────────────────────────── */

const JOIN_ROLES = [
  {
    number: "01",
    title: "Sinh viên",
    description:
      "Tìm việc và thực tập đã kiểm duyệt, nộp hồ sơ học bổng, tham gia talkshow cùng cựu sinh viên.",
    href: "/register?role=student",
    cta: "Đăng ký sinh viên",
  },
  {
    number: "02",
    title: "Cựu sinh viên",
    description:
      "Chia sẻ kinh nghiệm, nhận lời mời làm diễn giả và đồng hành cùng Quỹ Khuyến học.",
    href: "/register?role=alumni",
    cta: "Đăng ký cựu sinh viên",
  },
  {
    number: "03",
    title: "Doanh nghiệp",
    description:
      "Tạo hồ sơ công ty, đăng tin tuyển dụng và tài trợ học bổng. Tin được Khoa duyệt trước khi hiển thị.",
    href: "/register?role=employer",
    cta: "Đăng ký doanh nghiệp",
  },
];

export const JoinBand = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {JOIN_ROLES.map((role) => (
        <Link
          key={role.title}
          href={role.href}
          className="group flex flex-col gap-5 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-7"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">
              {role.number} / THAM GIA
            </span>
            <span
              aria-hidden="true"
              className="text-xl text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            >
              ↗
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-serif text-2xl font-medium tracking-tight text-foreground">
              {role.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {role.description}
            </p>
          </div>
          <span className="mt-auto border-t border-border pt-4 text-sm font-medium text-foreground">
            {role.cta}
          </span>
        </Link>
      ))}
    </div>
  );
};
