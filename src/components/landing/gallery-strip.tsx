"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import type { PublicAlbumPhotoDto } from "@/types/gallery";

interface GalleryStripProps {
  photos?: PublicAlbumPhotoDto[];
}

export const GalleryStrip = ({ photos = [] }: GalleryStripProps) => {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-background py-16 sm:py-20 border-t border-border/80 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10">
        <Reveal variant="fade">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border/60 pb-5">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pine-100 text-pine-800 dark:bg-pine-900/70 dark:text-pine-200 border border-pine-200 dark:border-pine-800">
                <Sparkles className="size-3.5 text-primary" />
                Khoảnh Khắc Đáng Nhớ
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Thư Viện Ảnh Truyền Thống
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Ghi dấu những kỷ niệm học tập, lễ tốt nghiệp và sự kiện kết nối của các thế hệ Thầy và Trò Khoa CNTT
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/gallery" />}
              className="cursor-pointer group"
            >
              <span>Xem tất cả album</span>
              <ArrowRight className="size-3.5 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </div>
        </Reveal>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {photos.slice(0, 8).map((photo, idx) => (
            <Reveal key={photo.id} index={idx} variant="up">
              <Link
                href={`/gallery/${photo.albumId}`}
                className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/70 hover:border-primary/60 hover:shadow-md transition-all duration-300 block"
              >
                <Image
                  src={photo.thumbUrl}
                  alt={photo.caption || "Ảnh tư liệu Khoa CNTT"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-108"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  {photo.caption ? (
                    <p className="text-white text-xs font-medium line-clamp-2 leading-snug">
                      {photo.caption}
                    </p>
                  ) : (
                    <span className="text-white/80 text-[11px] font-mono flex items-center gap-1">
                      <ImageIcon className="size-3" />
                      Xem album
                    </span>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
