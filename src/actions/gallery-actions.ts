"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  eventAlbums,
  albumPhotos,
  photoTakedownRequests,
  uploadedFiles,
} from "@/db/schema";
import { eq, and, sql, asc, inArray } from "drizzle-orm";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limiter";
import { canTransition } from "@/lib/state-machine";

export interface CreateAlbumInput {
  title: string;
  description?: string;
  eventId?: string;
}

export interface UpdateAlbumInput {
  title?: string;
  description?: string;
  eventId?: string | null;
  coverPhotoId?: string | null;
}

export interface TakedownRequestInput {
  photoId: string;
  requesterName: string;
  requesterContact: string;
  reason: string;
}

export const createAlbum = async (input: CreateAlbumInput) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  if (!input.title || input.title.trim().length < 3) {
    return { success: false, error: "Tiêu đề album phải có ít nhất 3 ký tự." };
  }

  try {
    const [album] = await db
      .insert(eventAlbums)
      .values({
        title: input.title.trim(),
        description: input.description?.trim() || null,
        eventId: input.eventId || null,
        status: "draft",
        createdBy: current.user.id,
      })
      .returning();

    await logAuditEvent({
      actorId: current.user.id,
      action: "create_event_album",
      entityType: "event_album",
      entityId: album.id,
      metadata: { title: album.title },
    });

    revalidatePath("/faculty-admin/gallery");
    revalidatePath("/gallery");
    return { success: true, data: album };
  } catch (err: any) {
    console.error("createAlbum error:", err);
    return { success: false, error: err?.message || "Không thể tạo album." };
  }
};

export const updateAlbum = async (id: string, input: UpdateAlbumInput) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  try {
    const [existing] = await db
      .select()
      .from(eventAlbums)
      .where(eq(eventAlbums.id, id));

    if (!existing) {
      return { success: false, error: "Album không tồn tại." };
    }

    const updates: Partial<typeof eventAlbums.$inferInsert> = {};
    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.description !== undefined) updates.description = input.description?.trim() || null;
    if (input.eventId !== undefined) updates.eventId = input.eventId || null;
    if (input.coverPhotoId !== undefined) updates.coverPhotoId = input.coverPhotoId || null;

    const [updated] = await db
      .update(eventAlbums)
      .set(updates)
      .where(eq(eventAlbums.id, id))
      .returning();

    await logAuditEvent({
      actorId: current.user.id,
      action: "update_event_album",
      entityType: "event_album",
      entityId: id,
      metadata: updates,
    });

    revalidatePath("/faculty-admin/gallery");
    revalidatePath(`/faculty-admin/gallery/${id}`);
    revalidatePath("/gallery");
    revalidatePath(`/gallery/${id}`);
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateAlbum error:", err);
    return { success: false, error: err?.message || "Không thể cập nhật album." };
  }
};

export const publishAlbum = async (id: string) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  try {
    const [existing] = await db
      .select()
      .from(eventAlbums)
      .where(eq(eventAlbums.id, id));

    if (!existing) return { success: false, error: "Album không tồn tại." };

    if (!canTransition("event_album", existing.status, "published")) {
      return { success: false, error: `Không thể chuyển trạng thái từ ${existing.status} sang published.` };
    }

    const [updated] = await db
      .update(eventAlbums)
      .set({
        status: "published",
        publishedAt: new Date(),
      })
      .where(eq(eventAlbums.id, id))
      .returning();

    await logAuditEvent({
      actorId: current.user.id,
      action: "publish_event_album",
      entityType: "event_album",
      entityId: id,
    });

    revalidatePath("/faculty-admin/gallery");
    revalidatePath(`/faculty-admin/gallery/${id}`);
    revalidatePath("/gallery");
    revalidatePath(`/gallery/${id}`);
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err?.message || "Không thể xuất bản album." };
  }
};

export const archiveAlbum = async (id: string) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  try {
    const [existing] = await db
      .select()
      .from(eventAlbums)
      .where(eq(eventAlbums.id, id));

    if (!existing) return { success: false, error: "Album không tồn tại." };

    if (!canTransition("event_album", existing.status, "archived")) {
      return { success: false, error: `Không thể lưu trữ album từ trạng thái ${existing.status}.` };
    }

    const [updated] = await db
      .update(eventAlbums)
      .set({ status: "archived" })
      .where(eq(eventAlbums.id, id))
      .returning();

    await logAuditEvent({
      actorId: current.user.id,
      action: "archive_event_album",
      entityType: "event_album",
      entityId: id,
    });

    revalidatePath("/faculty-admin/gallery");
    revalidatePath(`/faculty-admin/gallery/${id}`);
    revalidatePath("/gallery");
    revalidatePath(`/gallery/${id}`);
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err?.message || "Không thể lưu trữ album." };
  }
};

export const deleteAlbum = async (id: string) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  try {
    const [existing] = await db
      .select()
      .from(eventAlbums)
      .where(eq(eventAlbums.id, id));

    if (!existing) return { success: false, error: "Album không tồn tại." };

    await db.delete(eventAlbums).where(eq(eventAlbums.id, id));

    await logAuditEvent({
      actorId: current.user.id,
      action: "delete_event_album",
      entityType: "event_album",
      entityId: id,
      metadata: { title: existing.title },
    });

    revalidatePath("/faculty-admin/gallery");
    revalidatePath("/gallery");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Không thể xóa album." };
  }
};

export const uploadAlbumPhotos = async (albumId: string, fileIds: string[]) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  if (!fileIds || fileIds.length === 0) {
    return { success: false, error: "Không có ảnh nào được chọn để thêm." };
  }

  if (fileIds.length > 30) {
    return { success: false, error: "Chỉ được tải lên tối đa 30 ảnh trong mỗi lượt." };
  }

  try {
    const [album] = await db
      .select()
      .from(eventAlbums)
      .where(eq(eventAlbums.id, albumId));

    if (!album) return { success: false, error: "Album không tồn tại." };

    // Find current max sortOrder
    const [maxSortRes] = await db
      .select({ maxSort: sql<number>`COALESCE(MAX(${albumPhotos.sortOrder}), 0)` })
      .from(albumPhotos)
      .where(eq(albumPhotos.albumId, albumId));
    let nextSort = Number(maxSortRes?.maxSort ?? 0);

    const newRows = fileIds.map((fId) => {
      nextSort += 1;
      return {
        albumId,
        fileId: fId,
        sortOrder: nextSort,
        status: "published" as const,
        uploadedBy: current.user.id,
      };
    });

    const inserted = await db.insert(albumPhotos).values(newRows).returning();

    // Auto set cover if album does not have one
    if (!album.coverPhotoId && inserted.length > 0) {
      await db
        .update(eventAlbums)
        .set({ coverPhotoId: inserted[0].id })
        .where(eq(eventAlbums.id, albumId));
    }

    await logAuditEvent({
      actorId: current.user.id,
      action: "batch_upload_album_photos",
      entityType: "event_album",
      entityId: albumId,
      metadata: { count: inserted.length },
    });

    revalidatePath(`/faculty-admin/gallery/${albumId}`);
    revalidatePath(`/gallery/${albumId}`);
    return { success: true, count: inserted.length };
  } catch (err: any) {
    console.error("uploadAlbumPhotos error:", err);
    return { success: false, error: err?.message || "Không thể thêm ảnh vào album." };
  }
};

export const reorderAlbumPhotos = async (albumId: string, photoIds: string[]) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  try {
    for (let i = 0; i < photoIds.length; i++) {
      await db
        .update(albumPhotos)
        .set({ sortOrder: i + 1 })
        .where(and(eq(albumPhotos.id, photoIds[i]), eq(albumPhotos.albumId, albumId)));
    }

    revalidatePath(`/faculty-admin/gallery/${albumId}`);
    revalidatePath(`/gallery/${albumId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Không thể sắp xếp ảnh." };
  }
};

export const updatePhotoCaption = async (photoId: string, caption: string) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  try {
    const [photo] = await db
      .update(albumPhotos)
      .set({ caption: caption.trim() || null })
      .where(eq(albumPhotos.id, photoId))
      .returning();

    if (!photo) return { success: false, error: "Ảnh không tồn tại." };

    revalidatePath(`/faculty-admin/gallery/${photo.albumId}`);
    revalidatePath(`/gallery/${photo.albumId}`);
    return { success: true, data: photo };
  } catch (err: any) {
    return { success: false, error: err?.message || "Không thể cập nhật chú thích." };
  }
};

export const removePhoto = async (photoId: string, reason: string) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  try {
    const [photo] = await db
      .select()
      .from(albumPhotos)
      .where(eq(albumPhotos.id, photoId));

    if (!photo) return { success: false, error: "Ảnh không tồn tại." };

    if (!canTransition("album_photo", photo.status, "removed")) {
      return { success: false, error: "Ảnh đã ở trạng thái đã gỡ." };
    }

    await db
      .update(albumPhotos)
      .set({
        status: "removed",
        removedReason: reason.trim() || "Gỡ bởi quản trị viên",
        removedBy: current.user.id,
      })
      .where(eq(albumPhotos.id, photoId));

    await logAuditEvent({
      actorId: current.user.id,
      action: "remove_album_photo",
      entityType: "album_photo",
      entityId: photoId,
      metadata: { albumId: photo.albumId, reason },
    });

    revalidatePath(`/faculty-admin/gallery/${photo.albumId}`);
    revalidatePath(`/gallery/${photo.albumId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Không thể gỡ ảnh." };
  }
};

export const setAlbumCover = async (albumId: string, photoId: string) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  try {
    await db
      .update(eventAlbums)
      .set({ coverPhotoId: photoId })
      .where(eq(eventAlbums.id, albumId));

    revalidatePath("/faculty-admin/gallery");
    revalidatePath(`/faculty-admin/gallery/${albumId}`);
    revalidatePath("/gallery");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Không thể đặt ảnh bìa." };
  }
};

export const requestPhotoTakedown = async (input: TakedownRequestInput) => {
  // Rate limit public takedown requests: max 5 requests per 10 minutes per IP/contact
  const contactKey = input.requesterContact.trim().toLowerCase();
  const rateLimitResult = await checkRateLimit({
    key: `takedown:${contactKey}`,
    limit: 5,
    windowSeconds: 600,
  });

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 10 phút.",
    };
  }

  if (!input.requesterName?.trim() || !input.requesterContact?.trim() || !input.reason?.trim()) {
    return {
      success: false,
      error: "Vui lòng điền đầy đủ họ tên, thông tin liên hệ và lý do yêu cầu gỡ ảnh.",
    };
  }

  try {
    const [photo] = await db
      .select()
      .from(albumPhotos)
      .where(eq(albumPhotos.id, input.photoId));

    if (!photo || photo.status !== "published") {
      return { success: false, error: "Ảnh không tồn tại hoặc đã được gỡ trước đó." };
    }

    const current = await getCurrentUser();

    const [request] = await db
      .insert(photoTakedownRequests)
      .values({
        photoId: input.photoId,
        requesterUserId: current?.user?.id || null,
        requesterName: input.requesterName.trim(),
        requesterContact: input.requesterContact.trim(),
        reason: input.reason.trim(),
        status: "open",
      })
      .returning();

    await logAuditEvent({
      actorId: current?.user?.id || "anonymous",
      action: "request_photo_takedown",
      entityType: "photo_takedown_request",
      entityId: request.id,
      metadata: { photoId: input.photoId, requesterName: input.requesterName },
    });

    return {
      success: true,
      message:
        "Yêu cầu của bạn đã được tiếp nhận và sẽ được xử lý trong vòng 48 giờ làm việc theo Chính sách Thư viện ảnh của Nhà trường.",
    };
  } catch (err: any) {
    console.error("requestPhotoTakedown error:", err);
    return { success: false, error: err?.message || "Không thể gửi yêu cầu gỡ ảnh." };
  }
};

export const handlePhotoTakedownRequest = async (
  requestId: string,
  input: { action: "accept" | "reject"; handlerNote?: string },
) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  try {
    const [reqRow] = await db
      .select()
      .from(photoTakedownRequests)
      .where(eq(photoTakedownRequests.id, requestId));

    if (!reqRow) {
      return { success: false, error: "Yêu cầu gỡ ảnh không tồn tại." };
    }

    const nextStatus = input.action === "accept" ? ("accepted" as const) : ("rejected" as const);

    if (!canTransition("photo_takedown_request", reqRow.status, nextStatus)) {
      return {
        success: false,
        error: `Không thể chuyển trạng thái yêu cầu từ ${reqRow.status} sang ${nextStatus}.`,
      };
    }

    // If accepted, hide the photo
    if (input.action === "accept") {
      await db
        .update(albumPhotos)
        .set({
          status: "removed",
          removedReason: `Gỡ theo yêu cầu #${requestId}: ${reqRow.reason}`,
          removedBy: current.user.id,
        })
        .where(eq(albumPhotos.id, reqRow.photoId));
    }

    await db
      .update(photoTakedownRequests)
      .set({
        status: nextStatus,
        handlerNote: input.handlerNote?.trim() || null,
        handledBy: current.user.id,
        handledAt: new Date(),
      })
      .where(eq(photoTakedownRequests.id, requestId));

    await logAuditEvent({
      actorId: current.user.id,
      action: input.action === "accept" ? "accept_photo_takedown" : "reject_photo_takedown",
      entityType: "photo_takedown_request",
      entityId: requestId,
      metadata: { photoId: reqRow.photoId, handlerNote: input.handlerNote },
    });

    revalidatePath("/faculty-admin/gallery/takedown");
    revalidatePath("/gallery");
    return { success: true };
  } catch (err: any) {
    console.error("handlePhotoTakedownRequest error:", err);
    return { success: false, error: err?.message || "Không thể xử lý yêu cầu." };
  }
};
