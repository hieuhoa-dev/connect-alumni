"use server";

import { and, count, eq, ilike, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { newsArticles } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import { getPagination, isEntityId } from "@/lib/query-input";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { isNewsCategory, type NewsCategory } from "@/lib/text";
import { type NewsInput, newsSchema } from "@/validators/news-schema";

/** Cột công khai của tác giả: chỉ tên hiển thị, không email/SĐT. */
const PUBLIC_AUTHOR = {
  columns: { id: true, name: true },
  with: { profile: { columns: { fullName: true } } },
} as const;

const revalidateNewsPages = (id?: string) => {
  revalidatePath("/");
  revalidatePath("/news");
  if (id) revalidatePath(`/news/${id}`);
};

/**
 * Public: danh sách tin đã đăng (không kèm nội dung đầy đủ).
 * Tin được ghim lên trước, sau đó mới theo ngày đăng.
 */
export const getPublishedNews = async (params?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const { limit, offset } = getPagination(params, 12);
  const category: NewsCategory | undefined = isNewsCategory(params?.category)
    ? params.category
    : undefined;
  const search = params?.search?.trim();

  const where = {
    status: "published" as const,
    ...(category ? { category } : {}),
    ...(search ? { title: { ilike: `%${search}%` } } : {}),
  };

  const [items, totalRows] = await Promise.all([
    db.query.newsArticles.findMany({
      where,
      columns: {
        id: true,
        title: true,
        summary: true,
        coverImageUrl: true,
        category: true,
        isPinned: true,
        viewCount: true,
        publishedAt: true,
      },
      with: { author: PUBLIC_AUTHOR },
      orderBy: { isPinned: "desc", publishedAt: "desc" },
      limit,
      offset,
    }),
    db
      .select({ total: count() })
      .from(newsArticles)
      .where(
        and(
          eq(newsArticles.status, "published"),
          category ? eq(newsArticles.category, category) : undefined,
          search ? ilike(newsArticles.title, `%${search}%`) : undefined,
        ),
      ),
  ]);

  return { items, total: Number(totalRows[0]?.total ?? 0) };
};

/**
 * Public: chi tiết một tin. Tin nháp chỉ nhân viên Khoa xem được.
 * Tăng lượt xem khi tin đã đăng.
 */
export const getNewsById = async (id: string) => {
  if (!isEntityId(id)) return null;
  const [article, current] = await Promise.all([
    db.query.newsArticles.findFirst({
      where: { id },
      with: { author: PUBLIC_AUTHOR },
    }),
    getCurrentUser(),
  ]);

  if (!article) return null;

  const isStaff =
    current?.role === "faculty_staff" || current?.role === "admin";
  if (article.status !== "published" && !isStaff) return null;

  if (article.status === "published") {
    await db
      .update(newsArticles)
      .set({ viewCount: sql`${newsArticles.viewCount} + 1` })
      .where(eq(newsArticles.id, id));
  }

  return article;
};

/** Public: các tin cùng chuyên mục (trừ tin đang xem). */
export const getRelatedNews = async (id: string, category: NewsCategory) => {
  const items = await db.query.newsArticles.findMany({
    where: { status: "published", category },
    columns: {
      id: true,
      title: true,
      coverImageUrl: true,
      category: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
    limit: 4,
  });
  return items.filter((item) => item.id !== id).slice(0, 3);
};

/** Faculty/Admin: toàn bộ tin (kể cả nháp) để quản lý. */
export const getNewsForStaff = async () => {
  await requireRole(["faculty_staff", "admin"]);

  return await db.query.newsArticles.findMany({
    columns: {
      id: true,
      title: true,
      category: true,
      status: true,
      isPinned: true,
      viewCount: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    with: { author: PUBLIC_AUTHOR },
    orderBy: { createdAt: "desc" },
  });
};

/** Faculty/Admin: lấy một tin đầy đủ để chỉnh sửa. */
export const getNewsByIdForStaff = async (id: string) => {
  await requireRole(["faculty_staff", "admin"]);
  if (!isEntityId(id)) return null;

  return (
    (await db.query.newsArticles.findFirst({
      where: { id },
    })) ?? null
  );
};

/** Faculty/Admin: đăng tin mới (nháp hoặc đăng ngay). */
export const createNews = async (input: NewsInput) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validated = newsSchema.parse(input);

  const [article] = await db
    .insert(newsArticles)
    .values({
      authorId: current.user.id,
      title: validated.title,
      summary: validated.summary || null,
      content: sanitizeRichHtml(validated.content),
      coverImageUrl: validated.coverImageUrl || null,
      category: validated.category,
      isPinned: validated.isPinned,
      status: validated.status,
      publishedAt: validated.status === "published" ? new Date() : null,
    })
    .returning();

  await logAuditEvent({
    actorId: current.user.id,
    action: "create_news",
    entityType: "news_article",
    entityId: article.id,
    metadata: { title: article.title, status: article.status },
  });

  revalidateNewsPages(article.id);
  return article;
};

/** Faculty/Admin: cập nhật tin. Giữ nguyên ngày đăng đầu tiên nếu đã đăng trước đó. */
export const updateNews = async (id: string, input: NewsInput) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validated = newsSchema.parse(input);

  const existing = await db.query.newsArticles.findFirst({
    where: { id },
    columns: { id: true, publishedAt: true },
  });
  if (!existing) throw new Error("Không tìm thấy bài viết");

  const publishedAt =
    validated.status === "published"
      ? (existing.publishedAt ?? new Date())
      : existing.publishedAt;

  const [article] = await db
    .update(newsArticles)
    .set({
      title: validated.title,
      summary: validated.summary || null,
      content: sanitizeRichHtml(validated.content),
      coverImageUrl: validated.coverImageUrl || null,
      category: validated.category,
      isPinned: validated.isPinned,
      status: validated.status,
      publishedAt,
    })
    .where(eq(newsArticles.id, id))
    .returning();

  await logAuditEvent({
    actorId: current.user.id,
    action: "update_news",
    entityType: "news_article",
    entityId: id,
    metadata: { title: article.title, status: article.status },
  });

  revalidateNewsPages(id);
  return article;
};

/** Faculty/Admin: đổi trạng thái đăng / gỡ xuống nhanh từ danh sách. */
export const setNewsStatus = async (
  id: string,
  status: "draft" | "published",
) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validatedStatus = newsSchema.shape.status.unwrap().parse(status);

  const existing = await db.query.newsArticles.findFirst({
    where: { id },
    columns: { id: true, publishedAt: true },
  });
  if (!existing) throw new Error("Không tìm thấy bài viết");

  const [article] = await db
    .update(newsArticles)
    .set({
      status: validatedStatus,
      publishedAt:
        validatedStatus === "published"
          ? (existing.publishedAt ?? new Date())
          : existing.publishedAt,
    })
    .where(eq(newsArticles.id, id))
    .returning();

  await logAuditEvent({
    actorId: current.user.id,
    action: validatedStatus === "published" ? "publish_news" : "unpublish_news",
    entityType: "news_article",
    entityId: id,
  });

  revalidateNewsPages(id);
  return article;
};

/** Faculty/Admin: ghim hoặc bỏ ghim tin lên đầu trang chủ. */
export const setNewsPinned = async (id: string, isPinned: boolean) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validatedPinned = newsSchema.shape.isPinned.unwrap().parse(isPinned);

  const [article] = await db
    .update(newsArticles)
    .set({ isPinned: validatedPinned })
    .where(eq(newsArticles.id, id))
    .returning();

  if (!article) throw new Error("Không tìm thấy bài viết");

  await logAuditEvent({
    actorId: current.user.id,
    action: validatedPinned ? "pin_news" : "unpin_news",
    entityType: "news_article",
    entityId: id,
  });

  revalidateNewsPages(id);
  return article;
};

/** Faculty/Admin: xóa tin. */
export const deleteNews = async (id: string) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  const [removed] = await db
    .delete(newsArticles)
    .where(eq(newsArticles.id, id))
    .returning({ id: newsArticles.id, title: newsArticles.title });

  if (!removed) throw new Error("Không tìm thấy bài viết");

  await logAuditEvent({
    actorId: current.user.id,
    action: "delete_news",
    entityType: "news_article",
    entityId: id,
    metadata: { title: removed.title },
  });

  revalidateNewsPages(id);
  return { success: true };
};
