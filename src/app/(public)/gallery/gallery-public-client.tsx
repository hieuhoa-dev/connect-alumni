"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Image as ImageIcon, Calendar, Sparkles, Filter, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import type { PublicAlbumDto } from "@/types/gallery";

interface GalleryPublicClientProps {
  albums: PublicAlbumDto[];
  total: number;
  years: number[];
  currentPage: number;
  selectedYear?: number;
}

export const GalleryPublicClient = ({
  albums,
  total,
  years,
  currentPage,
  selectedYear,
}: GalleryPublicClientProps) => {
  const router = useRouter();

  const handleYearChange = (year?: number) => {
    const params = new URLSearchParams();
    if (year) params.set("year", year.toString());
    params.set("page", "1");
    router.push(`/gallery?${params.toString()}`);
  };

  return (
    <div className="w-full bg-background min-h-screen pb-20">
      {/* Hero Header */}
      <section className="relative w-full py-14 sm:py-18 bg-linear-to-b from-pine-900 via-pine-800 to-pine-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pine-700/30 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal variant="fade" className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pine-800/80 text-gold-300 border border-pine-700">
              <Sparkles className="size-3.5 text-gold-300" />
              Tư Liệu Truyền Thống
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Thư Viện Ảnh Khoa CNTT
            </h1>
            <p className="text-sm sm:text-base text-pine-100/90 leading-relaxed max-w-2xl">
              Nơi lưu giữ từng khoảnh khắc kỷ niệm, lễ tốt nghiệp trang trọng, các kỳ hội thảo khoa học và dấu ấn hoạt động của các thế hệ Cựu sinh viên Đại học Đà Lạt.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Year Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-border/70">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => handleYearChange(undefined)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                !selectedYear
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              Tất cả các năm
            </button>
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => handleYearChange(y)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedYear === y
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                Năm {y}
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Tổng cộng <strong className="text-foreground">{total}</strong> album
          </div>
        </div>

        {/* Albums Grid */}
        {albums.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-dashed border-border bg-card/40 my-8">
            <ImageIcon className="size-14 mx-auto text-muted-foreground mb-4 opacity-40" />
            <h3 className="font-bold text-lg text-foreground">Chưa có album nào</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Các hình ảnh sự kiện và lễ tốt nghiệp đang được ban biên tập tuyển chọn và cập nhật.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {albums.map((album, idx) => {
              const displayDate = album.publishedAt || album.createdAt;

              return (
                <Reveal key={album.id} index={idx} variant="up">
                  <Link
                    href={`/gallery/${album.id}`}
                    className="group flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-primary/50 hover:shadow-brand-hover transition-all duration-300"
                  >
                    {/* Cover Photo */}
                    <div className="relative aspect-16/10 w-full bg-muted overflow-hidden">
                      <Image
                        src={album.coverPhotoUrl}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

                      {/* Scrim overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                      {/* Photo count badge */}
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-mono font-medium flex items-center gap-1.5 border border-white/20">
                        <ImageIcon className="size-3.5 text-gold-300" />
                        <span>{album.photoCount} ảnh</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="size-3.5 text-primary" />
                          <span>{new Date(displayDate).toLocaleDateString("vi-VN")}</span>
                          {album.eventTitle && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[180px] text-primary font-medium">
                                {album.eventTitle}
                              </span>
                            </>
                          )}
                        </div>

                        <h2 className="font-extrabold text-foreground text-base group-hover:text-primary transition-colors line-clamp-2">
                          {album.title}
                        </h2>

                        {album.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {album.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
                        <span>Xem trọn bộ album</span>
                        <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
