"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DLULogo } from "@/components/shared/dlu-logo";
import { ArrowRight } from "lucide-react";
import { isSafeHref } from "@/lib/safe-url";
import { type HeroSlideData } from "@/types/hero";

export type { HeroSlideData };

export interface HeroSlideViewProps {
  slide: HeroSlideData;
  isActive?: boolean;
  priority?: boolean;
  reduceMotion?: boolean;
  isMobilePreview?: boolean;
  previewMode?: boolean;
  className?: string;
}

export const HeroSlideView = ({
  slide,
  isActive = true,
  priority = false,
  reduceMotion = false,
  isMobilePreview = false,
  previewMode = false,
  className,
}: HeroSlideViewProps) => {
  const hasTextOrActions =
    !!slide.badge ||
    !!slide.title ||
    !!slide.highlightText ||
    !!slide.description ||
    !!slide.primaryAction ||
    !!slide.secondaryAction;

  const hasSlideLink = isSafeHref(slide.linkHref);

  const desktopImage = slide.image.src || "/placeholder-cover.svg";
  const mobileImage = slide.image.mobileSrc || desktopImage;

  const slideContent = (
    <div
      className={cn(
        "relative w-full overflow-hidden flex items-center",
        previewMode
          ? isMobilePreview
            ? "aspect-[4/5] min-h-[360px] max-h-[420px]"
            : "aspect-[21/9] min-h-[220px] max-h-[300px]"
          : cn(
              "aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[460px] sm:min-h-[520px] lg:min-h-[580px]",
              isMobilePreview && "aspect-[4/5] min-h-[500px]",
            ),
        className,
      )}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Mobile image if available */}
        {slide.image.mobileSrc && !isMobilePreview ? (
          <>
            <div className="block sm:hidden absolute inset-0">
              <Image
                src={mobileImage}
                alt={slide.image.alt}
                fill
                sizes="100vw"
                priority={priority}
                className={cn(
                  "object-cover transition-transform duration-[6000ms] ease-out",
                  slide.overlayEnabled && isActive && !reduceMotion
                    ? "scale-105"
                    : "scale-100",
                )}
              />
            </div>
            <div className="hidden sm:block absolute inset-0">
              <Image
                src={desktopImage}
                alt={slide.image.alt}
                fill
                sizes="100vw"
                priority={priority}
                className={cn(
                  "object-cover transition-transform duration-[6000ms] ease-out",
                  slide.overlayEnabled && isActive && !reduceMotion
                    ? "scale-105"
                    : "scale-100",
                )}
              />
            </div>
          </>
        ) : (
          <Image
            src={isMobilePreview ? mobileImage : desktopImage}
            alt={slide.image.alt}
            fill
            sizes="100vw"
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-[6000ms] ease-out",
              slide.overlayEnabled && isActive && !reduceMotion
                ? "scale-105"
                : "scale-100",
            )}
          />
        )}

        {/* Scrim & Gradient Overlays only when overlayEnabled is true */}
        {slide.overlayEnabled && (
          <>
            <div className="absolute inset-0 bg-photo-scrim" />
            <div className="absolute inset-0 bg-gradient-to-t from-pine-950 via-pine-950/40 to-transparent opacity-85" />
          </>
        )}
      </div>

      {/* Content Overlay */}
      {hasTextOrActions && (
        <div
          className={cn(
            "container relative z-10 mx-auto",
            previewMode
              ? "px-4 sm:px-6 py-4 sm:py-6 max-w-4xl"
              : "max-w-7xl px-4 sm:px-6 lg:px-8 py-12",
          )}
        >
          <div
            className={cn(
              "text-white",
              previewMode
                ? "max-w-xl space-y-2"
                : "max-w-3xl space-y-4 sm:space-y-5",
            )}
          >
            {/* Badge */}
            {slide.badge && (
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full bg-white/10 font-semibold backdrop-blur-md border border-white/20 text-gold-300",
                  previewMode ? "px-2.5 py-0.5 text-[11px]" : "px-3.5 py-1 text-xs",
                )}
              >
                <DLULogo size={previewMode ? 16 : 20} className="shadow-xs shrink-0" />
                <span>{slide.badge}</span>
              </div>
            )}

            {/* Title as <h2> for proper accessibility semantics */}
            {slide.title && (
              <h2
                className={cn(
                  "font-serif font-semibold tracking-tight text-white leading-tight",
                  previewMode
                    ? "text-base sm:text-xl md:text-2xl"
                    : "text-3xl sm:text-5xl lg:text-6xl leading-[1.1]",
                )}
              >
                {slide.title}
                {slide.highlightText && (
                  <span
                    className={cn(
                      "block font-serif text-gradient-sun font-normal mt-1",
                      previewMode
                        ? "text-sm sm:text-lg md:text-xl"
                        : "text-2xl sm:text-4xl lg:text-5xl mt-1.5",
                    )}
                  >
                    {slide.highlightText}
                  </span>
                )}
              </h2>
            )}

            {/* Subheading if title is not present but highlightText is */}
            {!slide.title && slide.highlightText && (
              <p
                className={cn(
                  "font-serif text-gradient-sun font-normal",
                  previewMode
                    ? "text-sm sm:text-lg"
                    : "text-2xl sm:text-4xl lg:text-5xl",
                )}
              >
                {slide.highlightText}
              </p>
            )}

            {/* Description */}
            {slide.description && (
              <p
                className={cn(
                  "font-sans text-emerald-50/90",
                  previewMode
                    ? "text-[11px] sm:text-xs line-clamp-2 max-w-lg leading-snug"
                    : "text-sm sm:text-base lg:text-lg line-clamp-3 leading-relaxed max-w-2xl",
                )}
              >
                {slide.description}
              </p>
            )}

            {/* Action Buttons */}
            {(slide.primaryAction || slide.secondaryAction) && (
              <div
                className={cn(
                  "flex flex-wrap items-center",
                  previewMode ? "gap-2 pt-1" : "gap-3 pt-2",
                )}
              >
                {slide.primaryAction && isSafeHref(slide.primaryAction.href) && (
                  <Button
                    render={<Link href={slide.primaryAction.href} />}
                    nativeButton={false}
                    variant="sun"
                    size={previewMode ? "sm" : "lg"}
                    className={cn(
                      "rounded-full shadow-sun px-6 text-white font-semibold group",
                      previewMode ? "h-7 text-xs px-3.5" : "text-sm",
                    )}
                  >
                    <span>{slide.primaryAction.label}</span>
                    <ArrowRight className="size-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                )}

                {slide.secondaryAction && isSafeHref(slide.secondaryAction.href) && (
                  <Button
                    render={<Link href={slide.secondaryAction.href} />}
                    nativeButton={false}
                    variant="outline-light"
                    size={previewMode ? "sm" : "lg"}
                    className={cn(
                      "rounded-full px-6 text-white backdrop-blur-xs font-medium",
                      previewMode ? "h-7 text-xs px-3" : "text-sm",
                    )}
                  >
                    <span>{slide.secondaryAction.label}</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (hasSlideLink && !slide.primaryAction && !slide.secondaryAction) {
    return (
      <Link href={slide.linkHref!} className="block w-full cursor-pointer">
        {slideContent}
      </Link>
    );
  }

  return slideContent;
};
