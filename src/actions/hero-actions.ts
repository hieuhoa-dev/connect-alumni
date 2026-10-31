"use server";

import { db } from "@/db";
import { heroSlides, uploadedFiles } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { requireRole } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";
import { Result, ok, fail } from "@/lib/result";
import { isSafeHref } from "@/lib/safe-url";
import { verifyUploadedFile } from "@/server/services/upload-verification";
import { revalidatePath, revalidateTag } from "next/cache";

export interface HeroSlideInput {
  badge?: string | null;
  title?: string | null;
  highlightText?: string | null;
  description?: string | null;
  primaryLabel?: string | null;
  primaryHref?: string | null;
  secondaryLabel?: string | null;
  secondaryHref?: string | null;
  linkHref?: string | null;
  imageFileId: string;
  imageMobileFileId?: string | null;
  imageAlt: string;
  overlayEnabled: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: "draft" | "published";
}

export const createHeroSlide = async (
  input: HeroSlideInput,
): Promise<Result<{ id: string }>> => {
  const current = await requireRole(["faculty_staff", "admin"]);

  // Validation
  if (!input.imageFileId) {
    return fail("VALIDATION_ERROR", "Vui lòng tải lên ảnh banner chính.");
  }
  if (!input.imageAlt || input.imageAlt.trim().length < 5) {
    return fail("VALIDATION_ERROR", "Mô tả ảnh (Alt) bắt buộc ít nhất 5 ký tự để hỗ trợ tiếp cận.");
  }

  // Validate URLs
  if (input.primaryHref && !isSafeHref(input.primaryHref)) {
    return fail("VALIDATION_ERROR", "Liên kết nút chính không an toàn (chỉ chấp nhận '/' hoặc 'https://').");
  }
  if (input.secondaryHref && !isSafeHref(input.secondaryHref)) {
    return fail("VALIDATION_ERROR", "Liên kết nút phụ không an toàn (chỉ chấp nhận '/' hoặc 'https://').");
  }
  if (input.linkHref && !isSafeHref(input.linkHref)) {
    return fail("VALIDATION_ERROR", "Liên kết toàn slide không an toàn (chỉ chấp nhận '/' hoặc 'https://').");
  }

  // Verify file ownership and purpose
  const fileCheck = await verifyUploadedFile(input.imageFileId, current.user.id, "hero_banner");
  if (!fileCheck.valid) {
    return fail("FORBIDDEN", fileCheck.error || "Tệp ảnh banner không hợp lệ.");
  }

  // Calculate sort order
  const [maxOrder] = await db
    .select({ sortOrder: heroSlides.sortOrder })
    .from(heroSlides)
    .orderBy(desc(heroSlides.sortOrder))
    .limit(1);

  const nextOrder = (maxOrder?.sortOrder ?? -1) + 1;

  const startsAt = input.startsAt ? new Date(input.startsAt) : null;
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;

  if (startsAt && endsAt && endsAt <= startsAt) {
    return fail("VALIDATION_ERROR", "Thời gian kết thúc phải sau thời gian bắt đầu.");
  }

  const [inserted] = await db
    .insert(heroSlides)
    .values({
      badge: input.badge?.trim() || null,
      title: input.title?.trim() || null,
      highlightText: input.highlightText?.trim() || null,
      description: input.description?.trim() || null,
      primaryLabel: input.primaryLabel?.trim() || null,
      primaryHref: input.primaryHref?.trim() || null,
      secondaryLabel: input.secondaryLabel?.trim() || null,
      secondaryHref: input.secondaryHref?.trim() || null,
      linkHref: input.linkHref?.trim() || null,
      imageFileId: input.imageFileId,
      imageMobileFileId: input.imageMobileFileId || null,
      imageAlt: input.imageAlt.trim(),
      overlayEnabled: input.overlayEnabled,
      sortOrder: nextOrder,
      status: input.status || "draft",
      startsAt,
      endsAt,
      createdBy: current.user.id,
      updatedBy: current.user.id,
    })
    .returning();

  await logAuditEvent({
    actorId: current.user.id,
    action: "create_hero_slide",
    entityType: "hero_slide",
    entityId: inserted.id,
    metadata: { title: inserted.title },
  });

  revalidatePath("/");
  revalidatePath("/faculty-admin/landing/hero");

  return ok({ id: inserted.id });
};

export const updateHeroSlide = async (
  id: string,
  input: Partial<HeroSlideInput>,
): Promise<Result<{ success: boolean }>> => {
  const current = await requireRole(["faculty_staff", "admin"]);

  const [existing] = await db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.id, id))
    .limit(1);

  if (!existing) {
    return fail("NOT_FOUND", "Không tìm thấy slide.");
  }

  // Validate URLs if provided
  if (input.primaryHref !== undefined && input.primaryHref && !isSafeHref(input.primaryHref)) {
    return fail("VALIDATION_ERROR", "Liên kết nút chính không an toàn.");
  }
  if (input.secondaryHref !== undefined && input.secondaryHref && !isSafeHref(input.secondaryHref)) {
    return fail("VALIDATION_ERROR", "Liên kết nút phụ không an toàn.");
  }
  if (input.linkHref !== undefined && input.linkHref && !isSafeHref(input.linkHref)) {
    return fail("VALIDATION_ERROR", "Liên kết toàn slide không an toàn.");
  }

  const startsAt = input.startsAt !== undefined ? (input.startsAt ? new Date(input.startsAt) : null) : existing.startsAt;
  const endsAt = input.endsAt !== undefined ? (input.endsAt ? new Date(input.endsAt) : null) : existing.endsAt;

  if (startsAt && endsAt && endsAt <= startsAt) {
    return fail("VALIDATION_ERROR", "Thời gian kết thúc phải sau thời gian bắt đầu.");
  }

  await db
    .update(heroSlides)
    .set({
      badge: input.badge !== undefined ? input.badge?.trim() || null : existing.badge,
      title: input.title !== undefined ? input.title?.trim() || null : existing.title,
      highlightText: input.highlightText !== undefined ? input.highlightText?.trim() || null : existing.highlightText,
      description: input.description !== undefined ? input.description?.trim() || null : existing.description,
      primaryLabel: input.primaryLabel !== undefined ? input.primaryLabel?.trim() || null : existing.primaryLabel,
      primaryHref: input.primaryHref !== undefined ? input.primaryHref?.trim() || null : existing.primaryHref,
      secondaryLabel: input.secondaryLabel !== undefined ? input.secondaryLabel?.trim() || null : existing.secondaryLabel,
      secondaryHref: input.secondaryHref !== undefined ? input.secondaryHref?.trim() || null : existing.secondaryHref,
      linkHref: input.linkHref !== undefined ? input.linkHref?.trim() || null : existing.linkHref,
      imageFileId: input.imageFileId || existing.imageFileId,
      imageMobileFileId: input.imageMobileFileId !== undefined ? input.imageMobileFileId : existing.imageMobileFileId,
      imageAlt: input.imageAlt !== undefined ? input.imageAlt.trim() : existing.imageAlt,
      overlayEnabled: input.overlayEnabled !== undefined ? input.overlayEnabled : existing.overlayEnabled,
      startsAt,
      endsAt,
      updatedBy: current.user.id,
      updatedAt: new Date(),
    })
    .where(eq(heroSlides.id, id));

  await logAuditEvent({
    actorId: current.user.id,
    action: "update_hero_slide",
    entityType: "hero_slide",
    entityId: id,
  });

  revalidatePath("/");
  revalidatePath("/faculty-admin/landing/hero");

  return ok({ success: true });
};

export const publishHeroSlide = async (id: string): Promise<Result<{ success: boolean }>> => {
  const current = await requireRole(["faculty_staff", "admin"]);

  await db
    .update(heroSlides)
    .set({ status: "published", updatedBy: current.user.id, updatedAt: new Date() })
    .where(eq(heroSlides.id, id));

  await logAuditEvent({
    actorId: current.user.id,
    action: "publish_hero_slide",
    entityType: "hero_slide",
    entityId: id,
  });

  revalidatePath("/");
  revalidatePath("/faculty-admin/landing/hero");

  return ok({ success: true });
};

export const unpublishHeroSlide = async (id: string): Promise<Result<{ success: boolean }>> => {
  const current = await requireRole(["faculty_staff", "admin"]);

  await db
    .update(heroSlides)
    .set({ status: "draft", updatedBy: current.user.id, updatedAt: new Date() })
    .where(eq(heroSlides.id, id));

  await logAuditEvent({
    actorId: current.user.id,
    action: "unpublish_hero_slide",
    entityType: "hero_slide",
    entityId: id,
  });

  revalidatePath("/");
  revalidatePath("/faculty-admin/landing/hero");

  return ok({ success: true });
};

export const reorderHeroSlides = async (slideIds: string[]): Promise<Result<{ success: boolean }>> => {
  const current = await requireRole(["faculty_staff", "admin"]);

  await db.transaction(async (tx) => {
    for (let index = 0; index < slideIds.length; index++) {
      await tx
        .update(heroSlides)
        .set({ sortOrder: index, updatedBy: current.user.id, updatedAt: new Date() })
        .where(eq(heroSlides.id, slideIds[index]));
    }
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: "reorder_hero_slides",
    entityType: "hero_slide",
    entityId: "batch",
    metadata: { slideIds },
  });

  revalidatePath("/");
  revalidatePath("/faculty-admin/landing/hero");

  return ok({ success: true });
};

export const deleteHeroSlide = async (id: string): Promise<Result<{ success: boolean }>> => {
  const current = await requireRole(["faculty_staff", "admin"]);

  await db.delete(heroSlides).where(eq(heroSlides.id, id));

  await logAuditEvent({
    actorId: current.user.id,
    action: "delete_hero_slide",
    entityType: "hero_slide",
    entityId: id,
  });

  revalidatePath("/");
  revalidatePath("/faculty-admin/landing/hero");

  return ok({ success: true });
};

export const getAdminHeroSlides = async () => {
  await requireRole(["faculty_staff", "admin"]);

  const list = await db
    .select({
      slide: heroSlides,
      imageFile: uploadedFiles,
    })
    .from(heroSlides)
    .leftJoin(uploadedFiles, eq(heroSlides.imageFileId, uploadedFiles.id))
    .orderBy(asc(heroSlides.sortOrder));

  return list;
};

export type AdminHeroSlideRow = Awaited<ReturnType<typeof getAdminHeroSlides>>[number];

