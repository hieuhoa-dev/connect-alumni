import { and, count, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  companies,
  eventRegistrations,
  events,
  profiles,
  scholarshipCampaigns,
} from "@/db/schema";
import { makeExcerpt, NEWS_CATEGORY_LABEL } from "@/lib/text";

/**
 * Dữ liệu cho trang chủ công khai.
 *
 * Lưu ý bảo mật: file này KHÔNG có "use server" nên các hàm ở đây không bị biến
 * thành endpoint gọi được từ trình duyệt. Chỉ import từ Server Component.
 * Mỗi truy vấn chỉ lấy đúng các cột cần hiển thị — không kéo hồ sơ cá nhân
 * (số điện thoại, MSSV), danh sách đăng ký hay cam kết tài trợ của người dùng.
 */

export interface LandingPost {
  id: string;
  /** Đường dẫn đến bài (tin của Khoa hoặc bài chia sẻ của cựu sinh viên). */
  href: string;
  kind: "news" | "experience";
  isPinned: boolean;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  tags: string[];
  viewCount: number;
  publishedAt: Date | null;
  authorName: string;
  authorBatch: number | null;
}

export interface LandingPopularPost {
  id: string;
  href: string;
  title: string;
  viewCount: number;
}

export interface LandingEvent {
  id: string;
  title: string;
  type: string;
  format: "online" | "offline";
  locationOrLink: string;
  startTime: Date;
  endTime: Date;
  capacity: number | null;
  coverImageUrl: string | null;
  registrationCount: number;
}

export interface LandingJob {
  id: string;
  title: string;
  location: string;
  jobType: string;
  salaryRange: string | null;
  expiresAt: Date;
  companyName: string;
  companyLogoUrl: string | null;
}

export interface LandingCampaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  applicationDeadline: Date;
}

export interface LandingPartner {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface LandingStats {
  alumni: number;
  partners: number;
  events: number;
  fundReceived: number;
}

export interface LandingData {
  posts: LandingPost[];
  popular: LandingPopularPost[];
  events: LandingEvent[];
  jobs: LandingJob[];
  campaign: LandingCampaign | null;
  partners: LandingPartner[];
  stats: LandingStats;
}

/** Một truy vấn lỗi không được làm sập cả trang chủ. */
const safe = async <T>(label: string, task: () => Promise<T>, fallback: T) => {
  try {
    return await task();
  } catch (error) {
    console.error(`[landing] ${label} thất bại:`, error);
    return fallback;
  }
};

const fetchExperiencePosts = async (limit: number): Promise<LandingPost[]> => {
  const rows = await db.query.experiencePosts.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    limit,
    columns: {
      id: true,
      title: true,
      content: true,
      coverImageUrl: true,
      tags: true,
      viewCount: true,
      publishedAt: true,
    },
    with: {
      author: {
        columns: { name: true },
        with: {
          profile: {
            columns: { fullName: true, batchYear: true },
          },
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    href: `/experiences/${row.id}`,
    kind: "experience" as const,
    isPinned: false,
    title: row.title,
    excerpt: makeExcerpt(row.content, 200),
    coverImageUrl: row.coverImageUrl,
    tags: row.tags ?? [],
    viewCount: row.viewCount,
    publishedAt: row.publishedAt,
    authorName:
      row.author?.profile?.fullName || row.author?.name || "Cựu sinh viên",
    authorBatch: row.author?.profile?.batchYear ?? null,
  }));
};

/** Tin do Khoa đăng (module Tin tức). Tin được ghim luôn xếp trước. */
const fetchNewsPosts = async (limit: number): Promise<LandingPost[]> => {
  const rows = await db.query.newsArticles.findMany({
    where: { status: "published" },
    orderBy: { isPinned: "desc", publishedAt: "desc" },
    limit,
    columns: {
      id: true,
      title: true,
      summary: true,
      content: true,
      coverImageUrl: true,
      category: true,
      isPinned: true,
      viewCount: true,
      publishedAt: true,
    },
    with: {
      author: {
        columns: { name: true },
        with: { profile: { columns: { fullName: true } } },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    href: `/news/${row.id}`,
    kind: "news" as const,
    isPinned: row.isPinned,
    title: row.title,
    excerpt: row.summary?.trim() || makeExcerpt(row.content, 200),
    coverImageUrl: row.coverImageUrl,
    tags: [NEWS_CATEGORY_LABEL[row.category]],
    viewCount: row.viewCount,
    publishedAt: row.publishedAt,
    authorName:
      row.author?.profile?.fullName || row.author?.name || "Ban biên tập",
    authorBatch: null,
  }));
};

/**
 * Gộp tin của Khoa và bài chia sẻ của cựu sinh viên:
 * tin ghim trước, còn lại xếp theo ngày đăng mới nhất.
 */
const fetchPosts = async (limit: number): Promise<LandingPost[]> => {
  const [news, experiences] = await Promise.all([
    safe("news", () => fetchNewsPosts(limit), [] as LandingPost[]),
    safe("experiences", () => fetchExperiencePosts(limit), [] as LandingPost[]),
  ]);

  const time = (post: LandingPost) =>
    post.publishedAt ? new Date(post.publishedAt).getTime() : 0;

  return [...news, ...experiences]
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return time(b) - time(a);
    })
    .slice(0, limit);
};

const fetchPopular = async (): Promise<LandingPopularPost[]> => {
  const [news, experiences] = await Promise.all([
    db.query.newsArticles.findMany({
      where: { status: "published" },
      orderBy: { viewCount: "desc" },
      limit: 5,
      columns: { id: true, title: true, viewCount: true },
    }),
    db.query.experiencePosts.findMany({
      where: { status: "published" },
      orderBy: { viewCount: "desc" },
      limit: 5,
      columns: { id: true, title: true, viewCount: true },
    }),
  ]);

  return [
    ...news.map((row) => ({ ...row, href: `/news/${row.id}` })),
    ...experiences.map((row) => ({ ...row, href: `/experiences/${row.id}` })),
  ]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);
};

const fetchEvents = async (): Promise<LandingEvent[]> => {
  const rows = await db.query.events.findMany({
    where: { status: "published", endTime: { gte: new Date() } },
    orderBy: { startTime: "asc" },
    limit: 4,
    columns: {
      id: true,
      title: true,
      type: true,
      format: true,
      locationOrLink: true,
      startTime: true,
      endTime: true,
      capacity: true,
      coverImageUrl: true,
    },
  });

  if (rows.length === 0) return [];

  const counts = await db
    .select({ eventId: eventRegistrations.eventId, total: count() })
    .from(eventRegistrations)
    .where(
      inArray(
        eventRegistrations.eventId,
        rows.map((r) => r.id),
      ),
    )
    .groupBy(eventRegistrations.eventId);

  const countMap = new Map(counts.map((c) => [c.eventId, Number(c.total)]));

  return rows.map((row) => ({
    ...row,
    registrationCount: countMap.get(row.id) ?? 0,
  }));
};

const fetchJobs = async (): Promise<LandingJob[]> => {
  const rows = await db.query.jobPosts.findMany({
    where: {
      status: "approved",
      expiresAt: { gt: new Date() },
      company: { verificationStatus: "verified" },
    },
    orderBy: { createdAt: "desc" },
    limit: 5,
    columns: {
      id: true,
      title: true,
      location: true,
      jobType: true,
      salaryRange: true,
      expiresAt: true,
    },
    with: { company: { columns: { name: true, logoUrl: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    location: row.location,
    jobType: row.jobType,
    salaryRange: row.salaryRange,
    expiresAt: row.expiresAt,
    companyName: row.company?.name ?? "Doanh nghiệp đối tác",
    companyLogoUrl: row.company?.logoUrl ?? null,
  }));
};

const fetchCampaign = async (): Promise<LandingCampaign | null> => {
  const row = await db.query.scholarshipCampaigns.findFirst({
    where: { status: "open", applicationDeadline: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    columns: {
      id: true,
      title: true,
      description: true,
      targetAmount: true,
      currentAmount: true,
      applicationDeadline: true,
    },
  });
  if (!row) return null;
  return {
    ...row,
    targetAmount: Number(row.targetAmount),
    currentAmount: Number(row.currentAmount),
  };
};

const fetchPartners = async (): Promise<LandingPartner[]> => {
  return db.query.companies.findMany({
    where: { verificationStatus: "verified" },
    orderBy: { createdAt: "desc" },
    limit: 12,
    columns: { id: true, name: true, logoUrl: true },
  });
};

const fetchStats = async (): Promise<LandingStats> => {
  const [alumni, partners, eventTotal, fund] = await Promise.all([
    db
      .select({ value: count() })
      .from(profiles)
      .where(and(eq(profiles.role, "alumni"), eq(profiles.status, "active"))),
    db
      .select({ value: count() })
      .from(companies)
      .where(eq(companies.verificationStatus, "verified")),
    db
      .select({ value: count() })
      .from(events)
      .where(inArray(events.status, ["published", "completed"])),
    db
      .select({
        value: sql<string>`coalesce(sum(${scholarshipCampaigns.currentAmount}), 0)`,
      })
      .from(scholarshipCampaigns),
  ]);

  return {
    alumni: Number(alumni[0]?.value ?? 0),
    partners: Number(partners[0]?.value ?? 0),
    events: Number(eventTotal[0]?.value ?? 0),
    fundReceived: Number(fund[0]?.value ?? 0),
  };
};

export const getLandingData = async (): Promise<LandingData> => {
  const [posts, popular, eventList, jobs, campaign, partners, stats] =
    await Promise.all([
      safe("posts", () => fetchPosts(9), []),
      safe("popular", fetchPopular, []),
      safe("events", fetchEvents, []),
      safe("jobs", fetchJobs, []),
      safe("campaign", fetchCampaign, null),
      safe("partners", fetchPartners, []),
      safe("stats", fetchStats, {
        alumni: 0,
        partners: 0,
        events: 0,
        fundReceived: 0,
      }),
    ]);

  return {
    posts,
    popular,
    events: eventList,
    jobs,
    campaign,
    partners,
    stats,
  };
};
