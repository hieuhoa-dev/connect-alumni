"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pause, Play, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { DLULogo } from "@/components/shared/dlu-logo";
import { cn } from "cn";

interface SlideData {
  id: string;
  badge: string;
  title: string;
  highlightText?: string;
  description: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  image: string;
  imageAlt: string;
}

const slides: SlideData[] = [
  {
    id: "welcome",
    badge: "TRƯỜNG ĐẠI HỌC ĐÀ LẠT · KHOA CNTT",
    title: "Mừng bạn trở về nhà!",
    highlightText: "Nơi hội tụ, tri ân và tiếp bước tương lai",
    description:
      "Mạng lưới gắn kết các thế hệ Cựu sinh viên, Giảng viên, Doanh nghiệp đối tác và Sinh viên dưới bóng thông xanh xứ ngàn hoa.",
    primaryAction: {
      label: "Đăng ký tham gia",
      href: "/register",
    },
    secondaryAction: {
      label: "Cập nhật hồ sơ Cựu SV",
      href: "/login",
    },
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Khuôn viên Trường Đại học Đà Lạt trong nắng sớm",
  },
  {
    id: "homecoming",
    badge: "ĐẠI HỘI CỰU SINH VIÊN 2026",
    title: "DLU Homecoming: 30 Năm Truyền Thống",
    highlightText: "Khẳng định bản lĩnh & Tri thức Đà Lạt",
    description:
      "Chuỗi sự kiện kỷ niệm chặng đường vẻ vang 1996–2026, giao lưu chuyên đề công nghệ và ngày hội kết nối thế hệ sinh viên DLU.",
    primaryAction: {
      label: "Xem lịch trình sự kiện",
      href: "/events",
    },
    secondaryAction: {
      label: "Gương mặt tiêu biểu",
      href: "/experiences",
    },
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Cựu sinh viên và sinh viên Đại học Đà Lạt gặp gỡ",
  },
  {
    id: "jobs",
    badge: "SÀN TUYỂN DỤNG CHIẾN LƯỢC",
    title: "Kết Nối 50+ Tập Đoàn Công Nghệ",
    highlightText: "Cơ hội nghề nghiệp rộng mở",
    description:
      "Hàng trăm cơ hội việc làm thực tập, Fresher và Kỹ sư phần mềm từ các đối tác hàng đầu được xác thực chính quy bởi Nhà trường.",
    primaryAction: {
      label: "Khám phá việc làm",
      href: "/jobs",
    },
    secondaryAction: {
      label: "Dành cho Doanh nghiệp",
      href: "/employer/onboarding",
    },
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Môi trường làm việc công nghệ chuyên nghiệp",
  },
  {
    id: "scholarships",
    badge: "QUỸ KHUYẾN HỌC & TÀI TRỢ DLU",
    title: "Tiếp Sức Sinh Viên Vượt Khó",
    highlightText: "Chung tay thắp sáng ước mơ",
    description:
      "Đóng góp của quý Cựu sinh viên và Doanh nghiệp là nguồn động viên to lớn để các em sinh viên vững tâm trên giảng đường.",
    primaryAction: {
      label: "Ủng hộ quỹ khuyến học",
      href: "/scholarships",
    },
    secondaryAction: {
      label: "Nộp hồ sơ xin học bổng",
      href: "/scholarships",
    },
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Trao học bổng cho sinh viên xuất sắc",
  },
];

const AUTOPLAY_DURATION = 5000;

export const HeroCarousel = () => {
  const reduceMotion = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 35,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const scrollPrev = React.useCallback(() => {
    emblaApi?.scrollPrev();
    setProgress(0);
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    emblaApi?.scrollNext();
    setProgress(0);
  }, [emblaApi]);

  const scrollTo = React.useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
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
    if (reduceMotion || !isPlaying || isHovered) return;

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
  }, [reduceMotion, isPlaying, isHovered, scrollNext]);

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
                className="relative min-w-0 flex-[0_0_100%] aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center"
              >
                {/* Background Image with Ken Burns zoom */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.imageAlt}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    className={cn(
                      "object-cover transition-transform duration-[6000ms] ease-out",
                      isActive && !reduceMotion ? "scale-105" : "scale-100",
                    )}
                  />
                  {/* Photo Scrim & Brand Gradients */}
                  <div className="absolute inset-0 bg-photo-scrim" />
                  <div className="absolute inset-0 bg-gradient-to-t from-pine-950 via-pine-950/40 to-transparent opacity-80" />
                </div>

                {/* Content Overlay */}
                <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                  <div className="max-w-3xl space-y-4 sm:space-y-5">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 text-gold-300">
                      <DLULogo size={22} className="shadow-xs" />
                      <span>{slide.badge}</span>
                    </div>

                    {/* Main Title (Newsreader Serif) */}
                    <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
                      {slide.title}
                      {slide.highlightText && (
                        <span className="block text-gradient-sun text-2xl sm:text-4xl lg:text-5xl mt-1.5 font-normal">
                          {slide.highlightText}
                        </span>
                      )}
                    </h1>

                    {/* Description */}
                    <p className="text-sm sm:text-base lg:text-lg text-emerald-50/90 leading-relaxed max-w-2xl font-sans">
                      {slide.description}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button
                        render={<Link href={slide.primaryAction.href} />}
                        nativeButton={false}
                        variant="sun"
                        size="lg"
                        className="rounded-full shadow-sun px-6 text-sm font-semibold"
                      >
                        <span>{slide.primaryAction.label}</span>
                        <ArrowRight className="size-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </Button>

                      {slide.secondaryAction && (
                        <Button
                          render={<Link href={slide.secondaryAction.href} />}
                          nativeButton={false}
                          variant="outline-light"
                          size="lg"
                          className="rounded-full px-6 text-sm backdrop-blur-xs"
                        >
                          {slide.secondaryAction.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls & Progress Pill Bar */}
      <div className="absolute bottom-5 sm:bottom-7 left-0 right-0 z-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Progress Indicators & Play/Pause */}
          <div className="flex items-center gap-2.5 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label={isPlaying ? "Tạm dừng trình chiếu" : "Tiếp tục phát"}
              title={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? (
                <Pause className="size-3.5 fill-current" />
              ) : (
                <Play className="size-3.5 fill-current" />
              )}
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5 ml-1">
              {slides.map((slide, idx) => {
                const isActive = selectedIndex === idx;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => scrollTo(idx)}
                    className={cn(
                      "relative h-2 rounded-full overflow-hidden transition-all duration-300 cursor-pointer",
                      isActive ? "w-8 bg-white/20" : "w-2 bg-white/40 hover:bg-white/70",
                    )}
                    aria-label={`Chuyển đến slide ${idx + 1}`}
                  >
                    {isActive && (
                      <span
                        className="absolute inset-y-0 left-0 bg-sun-500 rounded-full transition-all duration-75"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Left/Right Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollPrev}
              className="flex size-10 items-center justify-center rounded-full bg-black/35 backdrop-blur-md border border-white/15 text-white/85 hover:text-white hover:bg-black/50 transition-all active:scale-95 cursor-pointer"
              aria-label="Slide trước đó"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="flex size-10 items-center justify-center rounded-full bg-black/35 backdrop-blur-md border border-white/15 text-white/85 hover:text-white hover:bg-black/50 transition-all active:scale-95 cursor-pointer"
              aria-label="Slide tiếp theo"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
