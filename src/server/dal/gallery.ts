import { db } from "@/db";
import {
  eventAlbums,
  albumPhotos,
  uploadedFiles,
  events,
  photoTakedownRequests,
  user,
} from "@/db/schema";
import { eq, and, desc, sql, count, asc, inArray } from "drizzle-orm";
import { getPublicFileUrl } from "@/lib/file-url";
import type { PublicAlbumPhotoDto, PublicAlbumDto } from "@/types/gallery";

export type { PublicAlbumPhotoDto, PublicAlbumDto };

export const getPublicAlbums = async (params: {
  page?: number;
  limit?: number;
  year?: number;
} = {}): Promise<{ albums: PublicAlbumDto[]; total: number; years: number[] }> => {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(50, params.limit || 12));
  const offset = (page - 1) * limit;

  try {
    // 1. Fetch available years for filter
    const yearRows = await db
      .select({
        year: sql<number>`DISTINCT EXTRACT(YEAR FROM COALESCE(${eventAlbums.publishedAt}, ${eventAlbums.createdAt}))::int`,
      })
      .from(eventAlbums)
      .where(eq(eventAlbums.status, "published"))
      .orderBy(sql`1 DESC`);
    const years = yearRows.map((r) => r.year).filter(Boolean);

    // 2. Base conditions
    const conditions = [eq(eventAlbums.status, "published")];
    if (params.year) {
      conditions.push(
        sql`EXTRACT(YEAR FROM COALESCE(${eventAlbums.publishedAt}, ${eventAlbums.createdAt})) = ${params.year}`,
      );
    }

    const whereClause = and(...conditions);

    // 3. Count total
    const [countRes] = await db
      .select({ total: count() })
      .from(eventAlbums)
      .where(whereClause);
    const total = Number(countRes?.total ?? 0);

    // 4. Fetch albums
    const albumList = await db
      .select({
        id: eventAlbums.id,
        title: eventAlbums.title,
        description: eventAlbums.description,
        status: eventAlbums.status,
        createdAt: eventAlbums.createdAt,
        publishedAt: eventAlbums.publishedAt,
        eventId: eventAlbums.eventId,
        coverPhotoId: eventAlbums.coverPhotoId,
        eventTitle: events.title,
      })
      .from(eventAlbums)
      .leftJoin(events, eq(eventAlbums.eventId, events.id))
      .where(whereClause)
      .orderBy(desc(sql`COALESCE(${eventAlbums.publishedAt}, ${eventAlbums.createdAt})`))
      .limit(limit)
      .offset(offset);

    // 5. Gather photo counts and cover files
    const albumsWithPhotos: PublicAlbumDto[] = await Promise.all(
      albumList.map(async (album) => {
        // Count published photos in album
        const [photoCountRes] = await db
          .select({ count: count() })
          .from(albumPhotos)
          .where(
            and(
              eq(albumPhotos.albumId, album.id),
              eq(albumPhotos.status, "published"),
            ),
          );
        const photoCount = Number(photoCountRes?.count ?? 0);

        let coverUrl = "/placeholder-cover.svg";

        // If coverPhotoId is set, look up its fileKey
        if (album.coverPhotoId) {
          const [coverPhoto] = await db
            .select({
              fileKey: uploadedFiles.fileKey,
              variants: uploadedFiles.variants,
            })
            .from(albumPhotos)
            .innerJoin(uploadedFiles, eq(albumPhotos.fileId, uploadedFiles.id))
            .where(eq(albumPhotos.id, album.coverPhotoId));

          if (coverPhoto) {
            coverUrl = getPublicFileUrl(
              { fileKey: coverPhoto.fileKey, variants: coverPhoto.variants as any },
              "md",
            );
          }
        }

        // Fallback: use first photo if cover is placeholder
        if (coverUrl === "/placeholder-cover.svg") {
          const [firstPhoto] = await db
            .select({
              fileKey: uploadedFiles.fileKey,
              variants: uploadedFiles.variants,
            })
            .from(albumPhotos)
            .innerJoin(uploadedFiles, eq(albumPhotos.fileId, uploadedFiles.id))
            .where(
              and(
                eq(albumPhotos.albumId, album.id),
                eq(albumPhotos.status, "published"),
              ),
            )
            .orderBy(asc(albumPhotos.sortOrder), asc(albumPhotos.createdAt))
            .limit(1);

          if (firstPhoto) {
            coverUrl = getPublicFileUrl(
              { fileKey: firstPhoto.fileKey, variants: firstPhoto.variants as any },
              "md",
            );
          }
        }

        return {
          id: album.id,
          title: album.title,
          description: album.description,
          status: album.status,
          createdAt: album.createdAt,
          publishedAt: album.publishedAt,
          eventId: album.eventId,
          eventTitle: album.eventTitle,
          coverPhotoUrl: coverUrl,
          photoCount,
        };
      }),
    );

    return { albums: albumsWithPhotos, total, years };
  } catch (err) {
    console.error("Failed to load public albums:", err);
    return { albums: [], total: 0, years: [] };
  }
};

export const getPublicAlbumById = async (id: string) => {
  try {
    const [album] = await db
      .select({
        id: eventAlbums.id,
        title: eventAlbums.title,
        description: eventAlbums.description,
        status: eventAlbums.status,
        createdAt: eventAlbums.createdAt,
        publishedAt: eventAlbums.publishedAt,
        eventId: eventAlbums.eventId,
        eventTitle: events.title,
        eventStartTime: events.startTime,
      })
      .from(eventAlbums)
      .leftJoin(events, eq(eventAlbums.eventId, events.id))
      .where(and(eq(eventAlbums.id, id), eq(eventAlbums.status, "published")));

    if (!album) return null;

    const photosList = await db
      .select({
        id: albumPhotos.id,
        albumId: albumPhotos.albumId,
        fileId: albumPhotos.fileId,
        fileKey: uploadedFiles.fileKey,
        variants: uploadedFiles.variants,
        caption: albumPhotos.caption,
        takenAt: albumPhotos.takenAt,
        sortOrder: albumPhotos.sortOrder,
      })
      .from(albumPhotos)
      .innerJoin(uploadedFiles, eq(albumPhotos.fileId, uploadedFiles.id))
      .where(
        and(
          eq(albumPhotos.albumId, id),
          eq(albumPhotos.status, "published"),
        ),
      )
      .orderBy(asc(albumPhotos.sortOrder), asc(albumPhotos.createdAt));

    const photos: PublicAlbumPhotoDto[] = photosList.map((p) => ({
      id: p.id,
      albumId: p.albumId,
      fileId: p.fileId,
      fileKey: p.fileKey,
      caption: p.caption,
      takenAt: p.takenAt,
      sortOrder: p.sortOrder,
      thumbUrl: getPublicFileUrl(
        { fileKey: p.fileKey, variants: p.variants as any },
        "thumb",
      ),
      fullUrl: getPublicFileUrl(
        { fileKey: p.fileKey, variants: p.variants as any },
        "lg",
      ),
    }));

    return { album, photos };
  } catch (err) {
    console.error(`Failed to load album ${id}:`, err);
    return null;
  }
};

export const getRecentAlbumPhotos = async (limit = 8): Promise<PublicAlbumPhotoDto[]> => {
  try {
    const list = await db
      .select({
        id: albumPhotos.id,
        albumId: albumPhotos.albumId,
        fileId: albumPhotos.fileId,
        fileKey: uploadedFiles.fileKey,
        variants: uploadedFiles.variants,
        caption: albumPhotos.caption,
        takenAt: albumPhotos.takenAt,
        sortOrder: albumPhotos.sortOrder,
      })
      .from(albumPhotos)
      .innerJoin(uploadedFiles, eq(albumPhotos.fileId, uploadedFiles.id))
      .innerJoin(eventAlbums, eq(albumPhotos.albumId, eventAlbums.id))
      .where(
        and(
          eq(eventAlbums.status, "published"),
          eq(albumPhotos.status, "published"),
        ),
      )
      .orderBy(desc(albumPhotos.createdAt))
      .limit(limit);

    return list.map((p) => ({
      id: p.id,
      albumId: p.albumId,
      fileId: p.fileId,
      fileKey: p.fileKey,
      caption: p.caption,
      takenAt: p.takenAt,
      sortOrder: p.sortOrder,
      thumbUrl: getPublicFileUrl(
        { fileKey: p.fileKey, variants: p.variants as any },
        "thumb",
      ),
      fullUrl: getPublicFileUrl(
        { fileKey: p.fileKey, variants: p.variants as any },
        "lg",
      ),
    }));
  } catch (err) {
    console.error("Failed to load recent album photos:", err);
    return [];
  }
};

export const getAdminAlbums = async () => {
  try {
    const list = await db
      .select({
        id: eventAlbums.id,
        title: eventAlbums.title,
        description: eventAlbums.description,
        status: eventAlbums.status,
        createdAt: eventAlbums.createdAt,
        publishedAt: eventAlbums.publishedAt,
        eventId: eventAlbums.eventId,
        coverPhotoId: eventAlbums.coverPhotoId,
        eventTitle: events.title,
        createdByName: user.name,
      })
      .from(eventAlbums)
      .leftJoin(events, eq(eventAlbums.eventId, events.id))
      .leftJoin(user, eq(eventAlbums.createdBy, user.id))
      .orderBy(desc(eventAlbums.createdAt));

    const result = await Promise.all(
      list.map(async (album) => {
        const [photoCountRes] = await db
          .select({ count: count() })
          .from(albumPhotos)
          .where(eq(albumPhotos.albumId, album.id));

        return {
          ...album,
          photoCount: Number(photoCountRes?.count ?? 0),
        };
      }),
    );

    return result;
  } catch (err) {
    console.error("Failed to load admin albums:", err);
    return [];
  }
};

export const getAdminAlbumById = async (id: string) => {
  try {
    const [album] = await db
      .select({
        id: eventAlbums.id,
        title: eventAlbums.title,
        description: eventAlbums.description,
        status: eventAlbums.status,
        createdAt: eventAlbums.createdAt,
        publishedAt: eventAlbums.publishedAt,
        eventId: eventAlbums.eventId,
        coverPhotoId: eventAlbums.coverPhotoId,
        eventTitle: events.title,
      })
      .from(eventAlbums)
      .leftJoin(events, eq(eventAlbums.eventId, events.id))
      .where(eq(eventAlbums.id, id));

    if (!album) return null;

    const photos = await db
      .select({
        id: albumPhotos.id,
        albumId: albumPhotos.albumId,
        fileId: albumPhotos.fileId,
        fileKey: uploadedFiles.fileKey,
        variants: uploadedFiles.variants,
        caption: albumPhotos.caption,
        takenAt: albumPhotos.takenAt,
        sortOrder: albumPhotos.sortOrder,
        status: albumPhotos.status,
        removedReason: albumPhotos.removedReason,
        createdAt: albumPhotos.createdAt,
      })
      .from(albumPhotos)
      .innerJoin(uploadedFiles, eq(albumPhotos.fileId, uploadedFiles.id))
      .where(eq(albumPhotos.albumId, id))
      .orderBy(asc(albumPhotos.sortOrder), asc(albumPhotos.createdAt));

    const photosWithUrls = photos.map((p) => ({
      ...p,
      thumbUrl: getPublicFileUrl(
        { fileKey: p.fileKey, variants: p.variants as any },
        "thumb",
      ),
      fullUrl: getPublicFileUrl(
        { fileKey: p.fileKey, variants: p.variants as any },
        "lg",
      ),
    }));

    return { album, photos: photosWithUrls };
  } catch (err) {
    console.error(`Failed to load admin album ${id}:`, err);
    return null;
  }
};

export const getAdminTakedownRequests = async () => {
  try {
    const list = await db
      .select({
        id: photoTakedownRequests.id,
        photoId: photoTakedownRequests.photoId,
        requesterName: photoTakedownRequests.requesterName,
        requesterContact: photoTakedownRequests.requesterContact,
        reason: photoTakedownRequests.reason,
        status: photoTakedownRequests.status,
        handlerNote: photoTakedownRequests.handlerNote,
        handledAt: photoTakedownRequests.handledAt,
        createdAt: photoTakedownRequests.createdAt,
        fileKey: uploadedFiles.fileKey,
        fileVariants: uploadedFiles.variants,
        albumId: albumPhotos.albumId,
        albumTitle: eventAlbums.title,
        photoStatus: albumPhotos.status,
      })
      .from(photoTakedownRequests)
      .innerJoin(albumPhotos, eq(photoTakedownRequests.photoId, albumPhotos.id))
      .innerJoin(uploadedFiles, eq(albumPhotos.fileId, uploadedFiles.id))
      .innerJoin(eventAlbums, eq(albumPhotos.albumId, eventAlbums.id))
      .orderBy(desc(photoTakedownRequests.createdAt));

    return list.map((item) => ({
      ...item,
      photoThumbUrl: getPublicFileUrl(
        { fileKey: item.fileKey, variants: item.fileVariants as any },
        "thumb",
      ),
    }));
  } catch (err) {
    console.error("Failed to load takedown requests:", err);
    return [];
  }
};
