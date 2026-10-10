import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Eye,
  GraduationCap,
  HeartHandshake,
  MapPin,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
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

type TagTone = "blue" | "green" | "yellow" | "red" | "slate";
const tones: Record<TagTone, string> = {
  blue: "border-[#BFDFFA]/60 bg-[#E1F3FE] text-[#1F6C9F]",
  green: "border-[#CDE3CB]/60 bg-[#EDF3EC] text-[#346538]",
  yellow: "border-[#EBD9A0]/60 bg-[#FBF3DB] text-[#956400]",
  red: "border-[#F5C2C4]/60 bg-[#FDEBEC] text-[#9F2F2D]",
  slate: "border-border bg-[#F1F1EF] text-[#444441]",
};
export const Tag = ({
  tone = "slate",
  className,
  children,
}: {
  tone?: TagTone;
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    className={cn(
      "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider",
      tones[tone],
      className,
    )}
  >
    {children}
  </span>
);
const EmptyBlock = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) => (
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
const Meta = ({
  post,
}: {
  post: Pick<
    LandingPost,
    "authorName" | "authorBatch" | "publishedAt" | "viewCount"
  >;
}) => (
  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
    <span className="font-medium text-foreground">
      {post.authorName}
      {post.authorBatch ? ` · K${post.authorBatch}` : ""}
    </span>
    {post.publishedAt && (
      <time className="font-mono">{formatDateVi(post.publishedAt)}</time>
    )}
    <span className="font-mono">
      <Eye className="mr-1 inline size-3" />
      {formatNumberVi(post.viewCount)}
    </span>
  </div>
);
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
}) => (
  <div className="flex items-end justify-between gap-4 border-t-2 border-foreground pt-3">
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" />
        {eyebrow}
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
      >
        {hrefLabel}
        <ArrowRight data-icon="inline-end" />
      </Button>
    )}
  </div>
);
export const Masthead = () => (
  <header className="flex flex-col gap-6 pb-6 pt-10 sm:pt-14">
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="flex max-w-3xl flex-col gap-3">
        <Tag tone="blue">Bản tin Khoa Công nghệ Thông tin</Tag>
        <h1 className="font-serif text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          Mạng lưới Cựu sinh viên{" "}
          <span className="italic text-foreground/80">
            và cơ hội nghề nghiệp
          </span>
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Tin chia sẻ từ cựu sinh viên, lịch sự kiện của Khoa, việc làm đã được
          kiểm duyệt và hoạt động Quỹ Khuyến học, cập nhật ở một nơi.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          render={<Link href="/register" />}
          nativeButton={false}
          size="lg"
        >
          <GraduationCap data-icon="inline-start" />
          Tham gia mạng lưới
        </Button>
        <Button
          render={<Link href="/jobs" />}
          nativeButton={false}
          variant="outline"
          size="lg"
        >
          <Briefcase data-icon="inline-start" />
          Xem việc làm
        </Button>
      </div>
    </div>
    <nav
      aria-label="Chuyên mục"
      className="flex flex-wrap gap-3 border-y border-border-strong py-2 text-sm"
    >
      {[
        "/experiences|Chia sẻ",
        "/events|Sự kiện",
        "/jobs|Tuyển dụng",
        "/scholarships|Quỹ khuyến học",
      ].map((item) => {
        const [href, label] = item.split("|");
        return (
          <Link
            key={href}
            href={href}
            className="text-muted-foreground hover:text-foreground"
          >
            {label}
          </Link>
        );
      })}
    </nav>
  </header>
);
export const LeadStory = ({ post }: { post?: LandingPost }) =>
  !post ? (
    <EmptyBlock
      icon={BookOpen}
      title="Chưa có bài chia sẻ nào được xuất bản"
      description="Bài viết sẽ hiển thị tại đây sau khi Khoa duyệt."
    />
  ) : (
    <article className="group relative flex flex-col gap-4">
      <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border border-border-strong bg-card">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="size-full object-cover"
          />
        ) : (
          <BookOpen className="size-10 text-muted-foreground/40" />
        )}
      </div>
      <Tag tone="blue">Tin nổi bật</Tag>
      <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
        <Link
          href={`/experiences/${post.id}`}
          className="group-hover:underline"
        >
          {post.title}
        </Link>
      </h2>
      <p className="text-base leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>
      <Meta post={post} />
    </article>
  );
export const LatestHeadlines = ({ posts }: { posts: LandingPost[] }) => (
  <aside>
    <h3 className="border-b border-border-strong pb-2 text-xs font-semibold uppercase tracking-wider">
      Tin mới đăng
    </h3>
    {posts.map((post) => (
      <article key={post.id} className="border-b border-border-strong py-4">
        <h4 className="font-serif text-lg">
          <Link href={`/experiences/${post.id}`} className="hover:underline">
            {post.title}
          </Link>
        </h4>
        <Meta post={post} />
      </article>
    ))}
  </aside>
);
export const StatsStrip = ({ stats }: { stats: LandingStats }) => (
  <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border-strong bg-border-strong md:grid-cols-4">
    {[
      [stats.alumni, "Cựu sinh viên trong mạng lưới"],
      [stats.partners, "Doanh nghiệp đã xác minh"],
      [stats.events, "Sự kiện đã và đang tổ chức"],
      [formatVndCompact(stats.fundReceived), "Quỹ Khuyến học đã tiếp nhận"],
    ].map(([value, label]) => (
      <div key={String(label)} className="bg-background p-5">
        <div className="font-mono text-2xl font-semibold">
          {typeof value === "number" ? formatNumberVi(value) : value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    ))}
  </section>
);
export const StoryGrid = ({ posts }: { posts: LandingPost[] }) => (
  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
    {posts.map((post) => (
      <article key={post.id} className="group">
        <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border border-border-strong bg-card">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="size-full object-cover"
            />
          ) : (
            <BookOpen className="text-muted-foreground/40" />
          )}
        </div>
        <Tag className="mt-3">{post.tags[0] ?? "Chia sẻ"}</Tag>
        <h3 className="mt-2 font-serif text-xl">
          <Link
            href={`/experiences/${post.id}`}
            className="group-hover:underline"
          >
            {post.title}
          </Link>
        </h3>
        <Meta post={post} />
      </article>
    ))}
  </div>
);
export const EventList = ({ events }: { events: LandingEvent[] }) =>
  events.length === 0 ? (
    <EmptyBlock
      icon={Calendar}
      title="Chưa có sự kiện sắp diễn ra"
      description="Lịch sự kiện mới sẽ được cập nhật tại đây."
    />
  ) : (
    <ul>
      {events.map((event) => (
        <li
          key={event.id}
          className="flex gap-4 border-b border-border-strong py-5"
        >
          <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-border-strong">
            <b className="font-mono text-xl">
              {formatDateVi(event.startTime, { day: "2-digit" })}
            </b>
            <small>
              Th{formatDateVi(event.startTime, { month: "numeric" })}
            </small>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              <Tag tone="blue">{EVENT_TYPE_LABEL[event.type] ?? "Sự kiện"}</Tag>
              <Tag tone={event.format === "online" ? "slate" : "green"}>
                {event.format === "online" ? "Trực tuyến" : "Trực tiếp"}
              </Tag>
            </div>
            <h3 className="font-serif text-xl">
              <Link href={`/events/${event.id}`} className="hover:underline">
                {event.title}
              </Link>
            </h3>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>
                <Clock className="mr-1 inline size-3.5" />
                {formatTimeVi(event.startTime)} - {formatTimeVi(event.endTime)}
              </span>
              <span>
                <MapPin className="mr-1 inline size-3.5" />
                {event.locationOrLink}
              </span>
              <span>{formatNumberVi(event.registrationCount)} đăng ký</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
export const JobList = ({ jobs }: { jobs: LandingJob[] }) =>
  jobs.length === 0 ? (
    <EmptyBlock
      icon={Briefcase}
      title="Chưa có tin tuyển dụng đang mở"
      description="Tin mới sẽ xuất hiện sau khi Khoa duyệt."
    />
  ) : (
    <ul>
      {jobs.map((job) => (
        <li
          key={job.id}
          className="flex gap-3 border-b border-border-strong py-4"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-strong font-semibold">
            {job.companyLogoUrl ? (
              <img
                src={job.companyLogoUrl}
                alt={job.companyName}
                className="size-full object-contain"
              />
            ) : (
              getInitials(job.companyName)
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              <Link href={`/jobs/${job.id}`} className="hover:underline">
                {job.title}
              </Link>
            </h3>
            <span className="text-xs text-muted-foreground">
              <Building2 className="mr-1 inline size-3" />
              {job.companyName}
            </span>
            <div className="flex flex-wrap gap-2">
              <Tag tone="green">
                {JOB_TYPE_LABEL[job.jobType] ?? job.jobType}
              </Tag>
              <span className="text-xs text-muted-foreground">
                <MapPin className="mr-1 inline size-3" />
                {job.location}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
export const FundCard = ({ campaign }: { campaign: LandingCampaign | null }) =>
  !campaign ? (
    <EmptyBlock
      icon={HeartHandshake}
      title="Chưa có chiến dịch đang mở"
      description="Tiến độ gây quỹ sẽ hiển thị tại đây."
    />
  ) : (
    <div className="flex flex-col gap-4 rounded-xl border border-border-strong bg-card p-5">
      <Tag tone="blue">Quỹ Khuyến học Khoa CNTT</Tag>
      <h3 className="font-serif text-xl">{campaign.title}</h3>
      <p className="text-sm text-muted-foreground">{campaign.description}</p>
      <Progress
        value={Math.min(
          100,
          Math.round(
            (campaign.currentAmount / (campaign.targetAmount || 1)) * 100,
          ),
        )}
        aria-label="Tiến độ gây quỹ"
      />
      <div className="font-mono text-xs">
        {formatVndCompact(campaign.currentAmount)} /{" "}
        {formatVndCompact(campaign.targetAmount)}
      </div>
      <Button
        render={<Link href={`/scholarships/${campaign.id}`} />}
        nativeButton={false}
      >
        Xem chiến dịch <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  );
export const PopularList = ({ posts }: { posts: LandingPopularPost[] }) => (
  <ol>
    {posts.map((post, index) => (
      <li
        key={post.id}
        className="flex gap-4 border-b border-border-strong py-3"
      >
        <span className="font-serif text-3xl text-muted-foreground/50">
          {index + 1}
        </span>
        <div>
          <Link
            href={`/experiences/${post.id}`}
            className="text-sm hover:underline"
          >
            {post.title}
          </Link>
          <div className="text-xs text-muted-foreground">
            <TrendingUp className="mr-1 inline size-3" />
            {formatNumberVi(post.viewCount)} lượt xem
          </div>
        </div>
      </li>
    ))}
  </ol>
);
export const PartnerWall = ({ partners }: { partners: LandingPartner[] }) => (
  <div className="grid grid-cols-2 overflow-hidden rounded-xl border-l border-t border-border-strong sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
    {partners.map((partner) => (
      <div
        key={partner.id}
        className="flex h-20 items-center justify-center border-b border-r border-border-strong px-4 text-center text-xs font-semibold text-muted-foreground"
      >
        {partner.logoUrl ? (
          <img
            src={partner.logoUrl}
            alt={partner.name}
            className="max-h-9 max-w-full object-contain"
          />
        ) : (
          partner.name
        )}
      </div>
    ))}
  </div>
);
const JOIN_ROLES: {
  icon: LucideIcon;
  title: string;
  cta: string;
  href: string;
}[] = [
  {
    icon: GraduationCap,
    title: "Sinh viên",
    cta: "Đăng ký sinh viên",
    href: "/register",
  },
  {
    icon: Award,
    title: "Cựu sinh viên",
    cta: "Đăng ký cựu sinh viên",
    href: "/register",
  },
  {
    icon: Building2,
    title: "Doanh nghiệp",
    cta: "Đăng ký doanh nghiệp",
    href: "/employer/onboarding",
  },
];

export const JoinBand = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {JOIN_ROLES.map(({ icon: Icon, title, cta, href }) => (
      <Link
        key={title}
        href={href}
        className="group rounded-xl border border-border-strong bg-card p-6"
      >
        <div className="mb-4">
          <Icon className="size-5" />
        </div>
        <h3 className="font-serif text-xl">{title}</h3>
        <span className="mt-4 inline-flex text-sm">
          {cta}
          <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5" />
        </span>
      </Link>
    ))}
  </div>
);
