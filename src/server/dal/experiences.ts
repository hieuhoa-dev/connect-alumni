import { db } from "@/db";

export interface PublicAuthorDTO {
  fullName: string;
  avatarUrl: string | null;
  batchYear: number | null;
  faculty: string | null;
}

export interface PublicExperiencePostDTO {
  id: string;
  title: string;
  content: string;
  coverImageUrl: string | null;
  tags: string[];
  viewCount: number;
  publishedAt: Date | null;
  author: PublicAuthorDTO;
}

/**
 * Data Access Layer: Query published alumni experience sharing posts.
 * Strips phone, studentCode, email, and user ID from author profile.
 */
export async function getPublicExperiencePosts(params?: {
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<PublicExperiencePostDTO[]> {
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

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    coverImageUrl: p.coverImageUrl,
    tags: p.tags || [],
    viewCount: p.viewCount,
    publishedAt: p.publishedAt,
    author: {
      fullName: p.author?.profile?.fullName || "Cựu sinh viên DLU",
      avatarUrl: p.author?.profile?.avatarUrl || null,
      batchYear: p.author?.profile?.batchYear || null,
      faculty: p.author?.profile?.faculty || null,
    },
  }));
}

/**
 * Data Access Layer: Query single published experience post by ID.
 */
export async function getPublicExperiencePostById(
  id: string
): Promise<PublicExperiencePostDTO | null> {
  const p = await db.query.experiencePosts.findFirst({
    where: {
      id,
    },
    with: {
      author: {
        with: {
          profile: true,
        },
      },
    },
  });

  if (!p || p.status !== "published") {
    return null;
  }

  return {
    id: p.id,
    title: p.title,
    content: p.content,
    coverImageUrl: p.coverImageUrl,
    tags: p.tags || [],
    viewCount: p.viewCount,
    publishedAt: p.publishedAt,
    author: {
      fullName: p.author?.profile?.fullName || "Cựu sinh viên DLU",
      avatarUrl: p.author?.profile?.avatarUrl || null,
      batchYear: p.author?.profile?.batchYear || null,
      faculty: p.author?.profile?.faculty || null,
    },
  };
}
