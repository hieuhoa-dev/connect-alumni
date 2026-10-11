"use client";

import * as React from "react";
import { Camera, Image as ImageIcon, Play, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MediaItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  date: string;
  tag: string;
}

const mediaItems: MediaItem[] = [
  {
    id: "g1",
    title: "Gala Kỷ Niệm 30 Năm Thành Lập Khoa CNTT",
    caption: "Hơn 500 cựu sinh viên các thế hệ quy tụ trong đêm hội tri ân và gắn kết tại Hội trường lớn.",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
    date: "11/2026",
    tag: "HOMECOMING",
  },
  {
    id: "g2",
    title: "Lễ Trao Học Bổng Cựu Sinh Viên Khóa 2026",
    caption: "Trao tặng 48 suất học bổng vượt khó cho các bạn sinh viên xuất sắc.",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    date: "09/2026",
    tag: "QUỸ KHUYẾN HỌC",
  },
  {
    id: "g3",
    title: "Tọa Đàm Kiến Trúc Phần Mềm & AI Trong Thực Tiễn",
    caption: "Buổi chia sẻ chuyên sâu giữa chuyên gia cựu sinh viên và sinh viên năm 3, năm 4.",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
    date: "08/2026",
    tag: "TALKSHOW",
  },
  {
    id: "g4",
    title: "Gặp Gỡ Đại Diện Doanh Nghiệp & Ký Kết Hợp Tác Lab",
    caption: "Ký kết chuyển giao công nghệ và xây dựng phòng nghiên cứu Điện toán Đám mây hiện đại.",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    date: "06/2026",
    tag: "HỢP TÁC",
  },
];

export const MediaGallery = () => {
  const [selectedItem, setSelectedItem] = React.useState<MediaItem | null>(null);

  return (
    <section id="media-gallery" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border/80 pb-4 mb-6">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            KHO TƯ LIỆU HÌNH ẢNH
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Khoảnh Khắc Gắn Kết & Kỷ Niệm Giảng Đường
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Ghi dấu những dấu ấn tri ân, gặp gỡ và sẻ chia qua từng thế hệ sinh viên
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <Camera className="size-3.5" />
          <span>Thư viện Media Khoa CNTT</span>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative rounded-xl border border-border/80 bg-card overflow-hidden cursor-pointer hover:border-foreground/40 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded bg-background/90 text-foreground border border-border/60 backdrop-blur-xs">
                  {item.tag}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3.5 space-y-1">
              <div className="text-[10px] font-mono text-muted-foreground">
                {item.date}
              </div>
              <h4 className="font-serif text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Lightbox Preview */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          {selectedItem && (
            <div>
              <div className="relative aspect-video w-full bg-black">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span className="px-2 py-0.5 rounded bg-muted text-foreground font-semibold">
                    {selectedItem.tag}
                  </span>
                  <span>{selectedItem.date}</span>
                </div>
                <DialogTitle className="font-serif text-lg font-bold text-foreground">
                  {selectedItem.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedItem.caption}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
