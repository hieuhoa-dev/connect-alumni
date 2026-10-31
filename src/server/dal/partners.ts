import { db } from "@/db";
import { companies, uploadedFiles } from "@/db/schema";
import { eq, and, desc, isNotNull } from "drizzle-orm";
import { getPublicFileUrl } from "@/lib/file-url";
import type { PartnerCompanyDto } from "@/types/partners";

export type { PartnerCompanyDto };

export const getVerifiedPartners = async (): Promise<PartnerCompanyDto[]> => {
  try {
    const list = await db
      .select({
        id: companies.id,
        name: companies.name,
        industry: companies.industry,
        isFeaturedPartner: companies.isFeaturedPartner,
        website: companies.website,
        logoUrl: companies.logoUrl,
        logoFileId: companies.logoFileId,
        fileKey: uploadedFiles.fileKey,
        fileVariants: uploadedFiles.variants,
      })
      .from(companies)
      .leftJoin(uploadedFiles, eq(companies.logoFileId, uploadedFiles.id))
      .where(
        and(
          eq(companies.verificationStatus, "verified"),
          // Must have either a valid logo_file_id or legacy logoUrl
          isNotNull(companies.logoUrl),
        ),
      )
      .orderBy(desc(companies.isFeaturedPartner), desc(companies.createdAt))
      .limit(20);

    return list.map((item) => {
      let resolvedLogo = item.logoUrl;
      if (item.fileKey) {
        resolvedLogo = getPublicFileUrl(
          {
            fileKey: item.fileKey,
            variants: item.fileVariants as any,
          },
          "thumb",
        );
      }
      return {
        id: item.id,
        name: item.name,
        industry: item.industry,
        isFeaturedPartner: item.isFeaturedPartner,
        website: item.website,
        logoUrl: resolvedLogo,
      };
    });
  } catch (err) {
    console.error("Failed to load verified partners:", err);
    return [];
  }
};
