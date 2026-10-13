"use client";

import Image from "next/image";
import Link from "next/link";
import { type KeyboardEvent, useEffect, useState } from "react";
import type { LandingBannerSlide } from "@/components/landing/landing-banner-data";
import { LandingImage } from "@/components/landing/landing-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ROTATION_DELAY = 5_000;

export const LandingBanner = ({ slides }: { slides: LandingBannerSlide[] }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [snapCount, setSnapCount] = useState(slides.length);
  const hasMultiple = snapCount > 1;
  const playing =
    motionReady &&
    hasMultiple &&
    !focused &&
    !dragging &&
    visible &&
    !reducedMotion;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    setMotionReady(true);
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!api) return;
    const updateSelection = () => {
      setSelected(api.selectedScrollSnap());
      setSnapCount(api.scrollSnapList().length);
    };
    const stopOnDrag = () => setDragging(true);
    const resumeAfterDrag = () => setDragging(false);
    updateSelection();
    api.on("select", updateSelection);
    api.on("reInit", updateSelection);
    api.on("pointerDown", stopOnDrag);
    api.on("pointerUp", resumeAfterDrag);
    return () => {
      api.off("select", updateSelection);
      api.off("reInit", updateSelection);
      api.off("pointerDown", stopOnDrag);
      api.off("pointerUp", resumeAfterDrag);
    };
  }, [api]);

  useEffect(() => {
    if (!api || !playing) return;
    let timer: number;
    const scheduleNext = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (api.canScrollNext()) api.scrollNext();
        else api.scrollTo(0);
        scheduleNext();
      }, ROTATION_DELAY);
    };
    scheduleNext();
    api.on("select", scheduleNext);
    api.on("reInit", scheduleNext);
    return () => {
      window.clearTimeout(timer);
      api.off("select", scheduleNext);
      api.off("reInit", scheduleNext);
    };
  }, [api, playing]);

  const move = (direction: "next" | "previous") => {
    if (direction === "next") api?.scrollNext(reducedMotion);
    else api?.scrollPrev(reducedMotion);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // ToggleGroup tự quản lý phím mũi tên để chọn mục.
    if ((event.target as HTMLElement).closest('[data-slot="toggle-group"]')) {
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? "next" : "previous");
    }
  };

  if (slides.length === 0) return null;

  return (
    <Carousel
      dir="rtl"
      opts={{ direction: "rtl", align: "start", loop: slides.length > 1 }}
      setApi={setApi}
      aria-labelledby="banner-heading"
      data-slot="landing-banner"
      data-active-slide={selected}
      data-rotation={playing ? "playing" : "paused"}
      onKeyDownCapture={handleKeyDown}
      onFocusCapture={(event) => {
        setFocused(event.target.matches(":focus-visible"));
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onPointerCancel={() => setDragging(false)}
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <div
        dir="ltr"
        className="flex flex-wrap items-center justify-between gap-3 bg-accent px-4 py-3 sm:px-6"
      >
        <h2 id="banner-heading" className="text-sm font-semibold text-primary">
          Tin tức & sự kiện
        </h2>
        {hasMultiple && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Mục trước"
              onClick={() => move("previous")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="m14 6-6 6 6 6" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Mục tiếp theo"
              onClick={() => move("next")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="m10 6 6 6-6 6" />
              </svg>
            </Button>
          </div>
        )}
      </div>

      <CarouselContent className="ml-0" data-slot="banner-track">
        {slides.map((slide, index) => (
          <CarouselItem
            key={slide.id}
            dir="ltr"
            className="pl-0"
            aria-label={`${index + 1} / ${slides.length}: ${slide.category}`}
            inert={index !== selected}
          >
            <div className="grid h-full md:min-h-80 md:grid-cols-[1.15fr_1fr]">
              <div className="flex min-w-0 flex-col items-start gap-4 p-6 sm:p-8">
                <Badge variant="secondary">{slide.category}</Badge>
                <h3 className="line-clamp-3 max-w-xl font-heading text-2xl font-semibold leading-snug tracking-tight text-primary sm:text-3xl">
                  {slide.title}
                </h3>
                <p className="line-clamp-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {slide.description}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {slide.meta}
                </p>
                <Button
                  render={<Link href={slide.href} />}
                  nativeButton={false}
                  className="mt-auto"
                >
                  {slide.action} <span aria-hidden="true">↗</span>
                </Button>
              </div>
              <div className="relative min-h-40 bg-accent sm:min-h-48 md:min-h-full">
                <LandingImage
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="absolute inset-0 size-full object-cover"
                  fallback={
                    <Image
                      src="/images/dlu-campus.jpg"
                      alt="Khuôn viên Đại học Đà Lạt"
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover"
                    />
                  }
                />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {hasMultiple && (
        <div
          dir="ltr"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-6"
        >
          <ToggleGroup
            value={[slides[selected]?.id ?? slides[0].id]}
            onValueChange={(values) => {
              const index = slides.findIndex((slide) => slide.id === values[0]);
              if (index < 0) return;
              api?.scrollTo(index, reducedMotion);
            }}
            aria-label="Chọn mục quảng bá"
            size="sm"
            className="flex-wrap"
          >
            {slides.map((slide, index) => (
              <ToggleGroupItem
                key={slide.id}
                value={slide.id}
                aria-label={`Xem mục ${index + 1}: ${slide.title}`}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span className="hidden sm:inline">{slide.category}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {String(selected + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      )}
      <p className="sr-only" aria-live={playing ? "off" : "polite"} aria-atomic>
        Mục {selected + 1} trên {slides.length}: {slides[selected]?.title}
      </p>
    </Carousel>
  );
};
