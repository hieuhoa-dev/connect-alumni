"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { experiencePosts } from "@/db/schema";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import {
  experiencePostSchema,
  experienceReviewSchema,
  ExperiencePostInput,
} from "@/validators/experience-schema";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";

/**
 * Public: Get published experience sharing posts
 */
export const getPublishedExperiencePosts = async (params?: {
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const limit = params?.limit || 20;
  const offset = params?.offset || 0;

  const posts = await db.query.experiencePosts.findMany({
    where: {
      status: "published",
      ...(params?.search ? { title: { ilike: `%${params.search}%` } } : {}),
    },
    with: {
      author: {
        with: {
          profile: true,
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
 * Get single post by ID and increment view count
 */
export const getExperiencePostById = async (id: string) => {
  const post = await db.query.experiencePosts.findFirst({
    where: {
      id: id,
    },
    with: {
      author: {
        with: {
          profile: true,
        },
      },
    },
  });

  if (post && post.status === "published") {
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
  const current = await getCurrentUser();
  if (!current?.user) {
    throw new Error("Vui lòng đăng nhập để chia sẻ kinh nghiệm");
  }

  const validated = experiencePostSchema.parse(input);

  const [post] = await db
    .insert(experiencePosts)
    .values({
      authorId: current.user.id,
      title: validated.title,
      content: validated.content,
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
  if (!current?.user) return [];

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
export const reviewExperiencePost = async (postId: string, status: "published" | "rejected") => {
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
        ? "Cảm ơn bạn đã đóng góp chia sẻ kinh nghiệm quý báu cho cộng đồng sinh viên Khoa."
        : "Vui lòng xem lại nội dung và chỉnh sửa phù hợp hơn.",
    linkUrl: `/student/experiences`,
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
export const getExperiencePostsForFaculty = async (status?: "pending" | "published" | "rejected") => {
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
