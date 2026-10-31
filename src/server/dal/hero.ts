import { db } from "@/db";
import { heroSlides, uploadedFiles } from "@/db/schema";
import { and, eq, lte, gt, or, isNull, asc } from "drizzle-orm";
import { DEFAULT_HERO_SLIDE, type HeroSlideData } from "@/types/hero";
import { getPublicFileUrl } from "@/lib/file-url";

export { DEFAULT_HERO_SLIDE, type HeroSlideData };

/**
 * Task C3: Public DAL fetching published active hero slides
 */
export async function getPublicHeroSlides(): Promise<HeroSlideData[]> {
  try {
    const now = new Date();

    const slidesWithFiles = await db
      .select({
        slide: heroSlides,
        imageFile: uploadedFiles,
      })
      .from(heroSlides)
      .leftJoin(uploadedFiles, eq(heroSlides.imageFileId, uploadedFiles.id))
      .where(
        and(
          eq(heroSlides.status, "published"),
          or(isNull(heroSlides.startsAt), lte(heroSlides.startsAt, now)),
          or(isNull(heroSlides.endsAt), gt(heroSlides.endsAt, now)),
        ),
      )
      .orderBy(asc(heroSlides.sortOrder))
      .limit(8);

    if (!slidesWithFiles || slidesWithFiles.length === 0) {
      return [DEFAULT_HERO_SLIDE];
    }

    // Map to DTO
    const dtoList: HeroSlideData[] = await Promise.all(
      slidesWithFiles.map(async ({ slide, imageFile }) => {
        let mobileSrc: string | null = null;
        if (slide.imageMobileFileId) {
          const [mobFile] = await db
            .select()
            .from(uploadedFiles)
            .where(eq(uploadedFiles.id, slide.imageMobileFileId))
            .limit(1);
          if (mobFile) {
            mobileSrc = getPublicFileUrl(mobFile);
          }
        }

        const desktopSrc = imageFile
          ? getPublicFileUrl(imageFile)
          : "/placeholder-cover.svg";

        return {
          id: slide.id,
          badge: slide.badge,
          title: slide.title,
          highlightText: slide.highlightText,
          description: slide.description,
          primaryAction:
            slide.primaryLabel && slide.primaryHref
              ? { label: slide.primaryLabel, href: slide.primaryHref }
              : null,
          secondaryAction:
            slide.secondaryLabel && slide.secondaryHref
              ? { label: slide.secondaryLabel, href: slide.secondaryHref }
              : null,
          linkHref: slide.linkHref,
          image: {
            src: desktopSrc,
            mobileSrc,
            alt: slide.imageAlt,
          },
          overlayEnabled: slide.overlayEnabled,
        };
      }),
    );

    return dtoList.length > 0 ? dtoList : [DEFAULT_HERO_SLIDE];
  } catch (error) {
    console.error("[getPublicHeroSlides] Error loading slides:", error);
    return [DEFAULT_HERO_SLIDE];
  }
}
