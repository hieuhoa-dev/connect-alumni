"use server";

import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";
import { Result, ok, fail } from "@/lib/result";
import { revalidatePath } from "next/cache";
import { isSafeHref } from "@/lib/safe-url";

export interface UpdateSiteSettingsInput {
  contactPhone?: string | null;
  contactEmail?: string | null;
  websiteUrl?: string | null;
  address?: string | null;
  mapUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  zaloUrl?: string | null;
  aiSurveySummaryEnabled?: boolean;
  aiWritingAssistantEnabled?: boolean;
}

export const updateSiteSettingsAction = async (
  input: UpdateSiteSettingsInput,
): Promise<Result<{ success: boolean }>> => {
  const current = await requireRole(["faculty_staff", "admin"]);

  // Validation
  if (input.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contactEmail)) {
    return fail("VALIDATION_ERROR", "Địa chỉ email liên hệ không hợp lệ.");
  }

  const urlFields = [
    { name: "websiteUrl", val: input.websiteUrl },
    { name: "mapUrl", val: input.mapUrl },
    { name: "facebookUrl", val: input.facebookUrl },
    { name: "youtubeUrl", val: input.youtubeUrl },
    { name: "zaloUrl", val: input.zaloUrl },
  ];

  for (const { name, val } of urlFields) {
    if (val && !isSafeHref(val)) {
      return fail("VALIDATION_ERROR", `Đường dẫn ${name} không an toàn (chỉ chấp nhận 'https://' hoặc '/').`);
    }
  }

  await db
    .insert(siteSettings)
    .values({
      id: "default",
      contactPhone: input.contactPhone?.trim() || null,
      contactEmail: input.contactEmail?.trim() || null,
      websiteUrl: input.websiteUrl?.trim() || null,
      address: input.address?.trim() || null,
      mapUrl: input.mapUrl?.trim() || null,
      facebookUrl: input.facebookUrl?.trim() || null,
      youtubeUrl: input.youtubeUrl?.trim() || null,
      zaloUrl: input.zaloUrl?.trim() || null,
      aiSurveySummaryEnabled: input.aiSurveySummaryEnabled ?? false,
      aiWritingAssistantEnabled: input.aiWritingAssistantEnabled ?? false,
      updatedBy: current.user.id,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: {
        contactPhone: input.contactPhone?.trim() || null,
        contactEmail: input.contactEmail?.trim() || null,
        websiteUrl: input.websiteUrl?.trim() || null,
        address: input.address?.trim() || null,
        mapUrl: input.mapUrl?.trim() || null,
        facebookUrl: input.facebookUrl?.trim() || null,
        youtubeUrl: input.youtubeUrl?.trim() || null,
        zaloUrl: input.zaloUrl?.trim() || null,
        aiSurveySummaryEnabled: input.aiSurveySummaryEnabled ?? false,
        aiWritingAssistantEnabled: input.aiWritingAssistantEnabled ?? false,
        updatedBy: current.user.id,
        updatedAt: new Date(),
      },
    });

  await logAuditEvent({
    actorId: current.user.id,
    action: "update_site_settings",
    entityType: "site_settings",
    entityId: "default",
  });

  revalidatePath("/");
  revalidatePath("/faculty-admin/settings");

  return ok({ success: true });
};
