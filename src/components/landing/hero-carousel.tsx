"use client";

import { cn } from "cn";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { HeroSlideView, type HeroSlideData } from "./hero-slide-view";
import { DEFAULT_HERO_SLIDE } from "@/types/hero";

const AUTOPLAY_DURATION = 6000;

interface HeroCarouselProps {
  slides?: HeroSlideData[];
}

export const HeroCarousel = ({ slides: propSlides }: HeroCarouselProps) => {
  const slides = propSlides && propSlides.length > 0 ? propSlides : [DEFAULT_HERO_SLIDE];
  const reduceMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(!reduceMotion);
  const [progress, setProgress] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 35,
    skipSnaps: false,
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
    setProgress(0);
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
    setProgress(0);
  }, [emblaApi]);

  const scrollTo = React.useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
      setProgress(0);
    },
    [emblaApi],
  );

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setProgress(0);
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay and progress ticker
  React.useEffect(() => {
    if (reduceMotion || !isPlaying || isHovered || slides.length <= 1) return;

    const intervalTime = 50;
    const step = (intervalTime / AUTOPLAY_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          scrollNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [reduceMotion, isPlaying, isHovered, scrollNext, slides.length]);

  // Pause on document hidden
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-pine-950 text-white"
      role="region"
      aria-roledescription="carousel"
      aria-label="Tin nổi bật Trường Đại học Đà Lạt"
      aria-live={isPlaying ? "off" : "polite"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsHovered(true)}
      onBlurCapture={() => setIsHovered(false)}
    >
      {/* Visual hidden h1 for homepage accessibility semantics (Task C2) */}
      <h1 className="sr-only">
        Mạng lưới Cựu sinh viên &amp; Doanh nghiệp Đối tác - Khoa Công nghệ Thông tin Trường Đại học Đà Lạt
      </h1>

      {/* Embla Viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => {
            const isActive = selectedIndex === index;
            return (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${slides.length}`}
                className="relative min-w-0 flex-[0_0_100%]"
              >
                <HeroSlideView
                  slide={slide}
                  isActive={isActive}
                  priority={index === 0}
                  reduceMotion={!!reduceMotion}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls only if more than 1 slide */}
      {slides.length > 1 && (
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Dots / Indicators */}
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  type="button"
                  key={`dot-${slides[idx]?.id || idx}`}
                  onClick={() => scrollTo(idx)}
                  className={cn(
                    "relative h-1.5 rounded-full transition-all duration-300 overflow-hidden",
                    selectedIndex === idx ? "w-8 bg-white/30" : "w-2 bg-white/20 hover:bg-white/40",
                  )}
                  aria-label={`Chuyển tới slide ${idx + 1}`}
                >
                  {selectedIndex === idx && (
                    <div
                      className="absolute inset-y-0 left-0 bg-sun-500 transition-all duration-75 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Play/Pause & Arrows */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                aria-label={isPlaying ? "Tạm dừng tự động chạy" : "Tiếp tục tự động chạy"}
              >
                {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </Button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={scrollPrev}
                className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                aria-label="Slide trước"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollNext}
                className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                aria-label="Slide tiếp theo"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
