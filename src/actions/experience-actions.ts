"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { experiencePosts } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import { getPagination, isEntityId } from "@/lib/query-input";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { getSearchableText, getSearchCondition } from "@/lib/search-query";
import { stripHtml } from "@/lib/text";
import {
  type ExperiencePostInput,
  experiencePostSchema,
  experienceReviewSchema,
} from "@/validators/experience-schema";

/**
 * Public: Get published experience sharing posts
 */
export const getPublishedExperiencePosts = async (params?: {
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const { limit, offset } = getPagination(params);
  const tag = params?.tag?.trim();
  const posts = await db.query.experiencePosts.findMany({
    where: {
      status: "published",
      ...(params?.search?.trim() || tag
        ? {
            RAW: (table) =>
              and(
                getSearchCondition(params?.search, [
                  table.title,
                  getSearchableText(table.content),
                  sql`(select string_agg(tag, ' ') from jsonb_array_elements_text(coalesce(${table.tags}, '[]'::jsonb)) as search_tags(tag))`,
                ]),
                // Keep the JSONB tag filter together with the word search.
                tag
                  ? sql`${table.tags} @> ${JSON.stringify([tag])}::jsonb`
                  : undefined,
              ) ?? sql`false`,
          }
        : {}),
    },
    with: {
      // Chỉ lấy các cột cần hiển thị, không lộ email, SĐT, MSSV của tác giả
      author: {
        columns: { id: true, name: true },
        with: {
          profile: {
            columns: {
              fullName: true,
              batchYear: true,
              bio: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    limit,
    offset,
  });

  return posts;
};

/**
 * Get single post by ID and increment view count.
 * Bài chưa xuất bản (pending, rejected, draft) chỉ tác giả và nhân sự quản trị xem được.
 */
export const getExperiencePostById = async (id: string) => {
  if (!isEntityId(id)) return null;
  const [post, current] = await Promise.all([
    db.query.experiencePosts.findFirst({
      where: {
        id: id,
      },
      with: {
        author: {
          columns: { id: true, name: true },
          with: {
            profile: {
              columns: {
                fullName: true,
                batchYear: true,
                bio: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!post) return null;

  const isActive = current?.profile?.status === "active";
  const isStaff =
    isActive &&
    (current?.role === "faculty_staff" || current?.role === "admin");
  const isAuthor = isActive && current?.user.id === post.authorId;
  if (post.status !== "published" && !isStaff && !isAuthor) return null;

  if (post.status === "published") {
    // Increment view count
    await db
      .update(experiencePosts)
      .set({ viewCount: sql`${experiencePosts.viewCount} + 1` })
      .where(eq(experiencePosts.id, id));
  }

  return post;
};

/**
 * Alumni: Create a new experience post
 * Strictly always requires faculty review (status: pending)
 */
export const createExperiencePost = async (input: ExperiencePostInput) => {
  // Chỉ alumni (và admin do bypass) mới được đăng bài chia sẻ kinh nghiệm
  const current = await requireRole(["alumni"]);

  const validated = experiencePostSchema.parse(input);
  const content = sanitizeRichHtml(validated.content);
  if (stripHtml(content).length < 20) {
    throw new Error(
      "Nội dung bài viết cần có ít nhất 20 ký tự sau khi định dạng",
    );
  }

  const [post] = await db
    .insert(experiencePosts)
    .values({
      authorId: current.user.id,
      title: validated.title,
      content,
      coverImageUrl: validated.coverImageUrl || null,
      tags: validated.tags || [],
      status: "pending", // Mandated review pipeline
    })
    .returning();

  await logAuditEvent({
    actorId: current.user.id,
    action: "create_experience_post",
    entityType: "experience_post",
    entityId: post.id,
    metadata: { title: post.title },
  });

  return post;
};

/**
 * Alumni: Get all posts created by current user
 */
export const getMyExperiencePosts = async () => {
  const current = await getCurrentUser();
  if (!current?.user || current.profile?.status !== "active") return [];

  return await db.query.experiencePosts.findMany({
    where: {
      authorId: current.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Faculty/Admin: Review experience post (Publish or Reject)
 */
export const reviewExperiencePost = async (
  postId: string,
  status: "published" | "rejected",
) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validated = experienceReviewSchema.parse({ status });

  const [updated] = await db
    .update(experiencePosts)
    .set({
      status: validated.status,
      publishedAt: validated.status === "published" ? new Date() : null,
    })
    .where(eq(experiencePosts.id, postId))
    .returning();

  if (!updated) {
    throw new Error("Không tìm thấy bài viết");
  }

  // Notify author
  await sendNotification({
    userId: updated.authorId,
    type: "experience_post_reviewed",
    title:
      validated.status === "published"
        ? `Bài chia sẻ "${updated.title}" của bạn đã được xuất bản!`
        : `Bài chia sẻ "${updated.title}" chưa được phê duyệt`,
    body:
      validated.status === "published"
        ? "Cảm ơn bạn đã đóng góp chia sẻ kinh nghiệm quý báu cho cộng đồng sinh viên Đại học Đà Lạt."
        : "Vui lòng xem lại nội dung và chỉnh sửa phù hợp hơn.",
    linkUrl: `/experiences/${updated.id}`,
    sendEmail: true,
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: `review_experience_post_${validated.status}`,
    entityType: "experience_post",
    entityId: updated.id,
  });

  return updated;
};

/**
 * Faculty/Admin: Get posts for review
 */
export const getExperiencePostsForFaculty = async (
  status?: "pending" | "published" | "rejected",
) => {
  await requireRole(["faculty_staff", "admin"]);

  return await db.query.experiencePosts.findMany({
    where: status ? { status } : undefined,
    with: {
      author: {
        with: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
