import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettingsDto,
} from "@/types/settings";

export { DEFAULT_SITE_SETTINGS, type SiteSettingsDto };

export async function getSiteSettings(): Promise<SiteSettingsDto> {
  try {
    const [settings] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);

    if (!settings) {
      return DEFAULT_SITE_SETTINGS;
    }

    return {
      contactPhone: settings.contactPhone || DEFAULT_SITE_SETTINGS.contactPhone,
      contactEmail: settings.contactEmail || DEFAULT_SITE_SETTINGS.contactEmail,
      websiteUrl: settings.websiteUrl || DEFAULT_SITE_SETTINGS.websiteUrl,
      address: settings.address || DEFAULT_SITE_SETTINGS.address,
      mapUrl: settings.mapUrl || DEFAULT_SITE_SETTINGS.mapUrl,
      facebookUrl: settings.facebookUrl || null,
      youtubeUrl: settings.youtubeUrl || null,
      zaloUrl: settings.zaloUrl || null,
      aiSurveySummaryEnabled: settings.aiSurveySummaryEnabled ?? false,
      aiWritingAssistantEnabled: settings.aiWritingAssistantEnabled ?? false,
    };
  } catch (err) {
    console.error("[getSiteSettings] Failed to fetch settings from DB:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}
