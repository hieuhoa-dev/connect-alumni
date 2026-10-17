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

import { sampleDLUExperiences } from "@/lib/dlu-sample-data";

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

  try {
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

    if (posts && posts.length > 0) return posts;
  } catch (err) {
    // Database offline
  }

  let filtered = [...sampleDLUExperiences];
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q),
    );
  }

  return filtered.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    status: "published" as const,
    publishedAt: new Date(p.publishedAt),
    tags: p.tags,
    viewCount: 128,
    createdAt: new Date(p.publishedAt),
    updatedAt: new Date(),
    author: {
      id: "author-" + p.id,
      name: p.author.name,
      profile: {
        id: "prof-" + p.id,
        fullName: p.author.profile?.fullName || p.author.name,
        bio: p.author.profile?.bio,
        avatarUrl: p.author.profile?.avatarUrl,
        role: "alumni",
      },
    },
  }));
};

/**
 * Get single post by ID and increment view count
 */
export const getExperiencePostById = async (id: string) => {
  try {
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
      try {
        await db
          .update(experiencePosts)
          .set({ viewCount: sql`${experiencePosts.viewCount} + 1` })
          .where(eq(experiencePosts.id, id));
      } catch (e) {}
      return post;
    }
  } catch (err) {
    // Database offline
  }

  const sample = sampleDLUExperiences.find((p) => p.id === id);
  if (sample) {
    return {
      id: sample.id,
      title: sample.title,
      content: sample.content,
      status: "published" as const,
      publishedAt: new Date(sample.publishedAt),
      tags: sample.tags,
      viewCount: 154,
      createdAt: new Date(sample.publishedAt),
      updatedAt: new Date(),
      author: {
        id: "author-" + sample.id,
        name: sample.author.name,
        profile: {
          id: "prof-" + sample.id,
          fullName: sample.author.profile?.fullName || sample.author.name,
          bio: sample.author.profile?.bio,
          avatarUrl: sample.author.profile?.avatarUrl,
          role: "alumni",
        },
      },
    };
  }

  return null;
};

/**
 * Alumni: Create a new experience post
 * Strictly always requires faculty review (status: pending)
 */
export const createExperiencePost = async (input: ExperiencePostInput) => {
  // Chỉ alumni (và admin do bypass) mới được đăng bài chia sẻ kinh nghiệm
  const current = await requireRole(["alumni"]);

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

  try {
    return await db.query.experiencePosts.findMany({
      where: {
        authorId: current.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (err) {
    return [
      {
        id: "exp-demo-1",
        title: "Kinh nghiệm ứng tuyển và phỏng vấn vị trí Software Engineer tại các tập đoàn công nghệ lớn",
        content: "Chia sẻ lộ trình chuẩn bị CV, thuật toán Leetcode và kiến thức System Design.",
        tags: ["Career", "Software", "Tech"],
        status: "published" as const,
        viewCount: 142,
        createdAt: new Date(),
        publishedAt: new Date(),
      },
    ];
  }
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
