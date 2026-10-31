"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
  CheckCircle2,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { requestPhotoTakedown } from "@/actions/gallery-actions";
import { toast } from "@/components/ui/toast";
import type { PublicAlbumPhotoDto } from "@/types/gallery";

interface AlbumDetail {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  publishedAt: Date | null;
  eventId: string | null;
  eventTitle?: string | null;
  eventStartTime?: Date | null;
}

interface AlbumViewClientProps {
  album: AlbumDetail;
  photos: PublicAlbumPhotoDto[];
}

export const AlbumViewClient = ({ album, photos }: AlbumViewClientProps) => {
  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  // Takedown dialog state
  const [takedownPhoto, setTakedownPhoto] = React.useState<PublicAlbumPhotoDto | null>(null);
  const [requesterName, setRequesterName] = React.useState("");
  const [requesterContact, setRequesterContact] = React.useState("");
  const [takedownReasonCategory, setTakedownReasonCategory] = React.useState("Ảnh cá nhân không mong muốn xuất hiện");
  const [takedownNote, setTakedownNote] = React.useState("");
  const [isSubmittingTakedown, setIsSubmittingTakedown] = React.useState(false);

  // Keyboard navigation for Lightbox
  React.useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, photos.length]);

  const activePhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  const handleOpenTakedown = (photo: PublicAlbumPhotoDto, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTakedownPhoto(photo);
  };

  const handleSubmitTakedown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!takedownPhoto) return;

    if (!requesterName.trim() || !requesterContact.trim()) {
      toast.error("Vui lòng cung cấp họ tên và số điện thoại hoặc email liên hệ.");
      return;
    }

    setIsSubmittingTakedown(true);
    try {
      const combinedReason = `${takedownReasonCategory}${
        takedownNote.trim() ? ` — Chi tiết: ${takedownNote.trim()}` : ""
      }`;

      const res = await requestPhotoTakedown({
        photoId: takedownPhoto.id,
        requesterName: requesterName.trim(),
        requesterContact: requesterContact.trim(),
        reason: combinedReason,
      });

      if (!res.success) {
        toast.error(res.error || "Không thể gửi yêu cầu gỡ ảnh");
        return;
      }

      toast.success(
        res.message ||
          "Yêu cầu của bạn đã được tiếp nhận và sẽ được xử lý trong vòng 48 giờ làm việc theo Chính sách Thư viện ảnh của Nhà trường.",
      );
      setTakedownPhoto(null);
      setRequesterName("");
      setRequesterContact("");
      setTakedownNote("");
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra khi gửi yêu cầu.");
    } finally {
      setIsSubmittingTakedown(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: album.title,
        text: album.description || "Bộ ảnh kỷ niệm Khoa CNTT - Đại học Đà Lạt",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết album vào bộ nhớ tạm!");
    }
  };

  const displayDate = album.publishedAt || album.createdAt;

  return (
    <div className="w-full bg-background min-h-screen pb-24">
      {/* Header section */}
      <section className="w-full border-b border-border bg-card/60 py-8 sm:py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Quay lại Thư viện ảnh
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <Calendar className="size-3.5 text-primary" />
                    {new Date(displayDate).toLocaleDateString("vi-VN")}
                  </span>
                  <span>•</span>
                  <span className="font-mono">{photos.length} bức ảnh</span>
                  {album.eventTitle && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-primary font-semibold">
                        Sự kiện: {album.eventTitle}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                  {album.title}
                </h1>

                {album.description && (
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {album.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-start lg:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="cursor-pointer"
                >
                  <Share2 className="size-3.5 mr-1.5" />
                  Chia Sẻ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {photos.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-dashed border-border bg-card/40">
            <ImageIcon className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
            <h3 className="font-bold text-base text-foreground">Album chưa có ảnh công khai</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Ảnh đang được kiểm duyệt và sẽ hiển thị trong thời gian sớm nhất.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer border border-border/60 hover:border-primary/60 hover:shadow-md transition-all duration-200"
              >
                <Image
                  src={photo.thumbUrl}
                  alt={photo.caption || `Ảnh ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Scrim on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => handleOpenTakedown(photo, e)}
                      title="Yêu cầu gỡ ảnh này"
                      className="size-7 rounded-md bg-black/60 hover:bg-destructive text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="size-3.5" />
                    </button>
                  </div>

                  {photo.caption && (
                    <p className="text-[11px] text-white font-medium line-clamp-2 leading-tight">
                      {photo.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between select-none"
        >
          {/* Top toolbar */}
          <div className="p-4 flex items-center justify-between text-white bg-black/40 backdrop-blur-xs z-20">
            <div className="text-xs font-mono font-medium tracking-wider">
              {lightboxIndex + 1} / {photos.length}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenTakedown(activePhoto)}
                className="bg-black/40 border-white/20 text-white hover:bg-destructive hover:border-destructive hover:text-white text-xs cursor-pointer"
              >
                <ShieldAlert className="size-3.5 mr-1" />
                Yêu Cầu Gỡ Ảnh
              </Button>

              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                title="Đóng (Esc)"
                className="size-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Main Image View */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            {/* Prev button */}
            <button
              type="button"
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : photos.length - 1,
                )
              }
              title="Ảnh trước (Mũi tên trái)"
              className="absolute left-4 z-10 size-11 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-6" />
            </button>

            {/* Active Image */}
            <div className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center">
              <Image
                src={activePhoto.fullUrl}
                alt={activePhoto.caption || "Ảnh phóng to"}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null && prev < photos.length - 1 ? prev + 1 : 0,
                )
              }
              title="Ảnh sau (Mũi tên phải)"
              className="absolute right-4 z-10 size-11 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>

          {/* Bottom caption bar */}
          <div className="p-4 bg-black/60 backdrop-blur-xs text-center text-white text-xs sm:text-sm z-20 min-h-[48px] flex items-center justify-center">
            {activePhoto.caption ? (
              <p className="max-w-2xl mx-auto leading-relaxed">{activePhoto.caption}</p>
            ) : (
              <span className="text-white/40 italic">Chưa có chú thích</span>
            )}
          </div>
        </div>
      )}

      {/* Modal Yêu Cầu Gỡ Ảnh */}
      <Dialog open={!!takedownPhoto} onOpenChange={(open) => !open && setTakedownPhoto(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmitTakedown} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="size-5" />
                Yêu Cầu Gỡ Ảnh Khỏi Thư Viện
              </DialogTitle>
              <DialogDescription>
                Theo Chính sách Bản quyền & Bảo vệ Dữ liệu Cá nhân của Trường Đại học Đà Lạt, bạn có quyền yêu cầu gỡ bỏ hình ảnh của mình. Ban Biên tập sẽ xử lý trong vòng tối đa 48 giờ làm việc.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Họ và tên của bạn <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Số điện thoại hoặc Email liên hệ <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  placeholder="Ví dụ: 0901234567 hoặc nva@dlu.edu.vn"
                  value={requesterContact}
                  onChange={(e) => setRequesterContact(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Lý do yêu cầu gỡ ảnh
                </label>
                <select
                  value={takedownReasonCategory}
                  onChange={(e) => setTakedownReasonCategory(e.target.value)}
                  className="w-full h-9 px-3 mt-1 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Ảnh cá nhân không mong muốn xuất hiện">
                    Ảnh cá nhân không mong muốn xuất hiện
                  </option>
                  <option value="Ảnh nhạy cảm / vi phạm quyền riêng tư">
                    Ảnh nhạy cảm / vi phạm quyền riêng tư
                  </option>
                  <option value="Ảnh sai thông tin / chú thích gây hiểu nhầm">
                    Ảnh sai thông tin / chú thích gây hiểu nhầm
                  </option>
                  <option value="Lý do cá nhân khác">Lý do cá nhân khác</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Ghi chú thêm (Tùy chọn)
                </label>
                <Input
                  placeholder="Mô tả cụ thể người hoặc chi tiết cần hỗ trợ..."
                  value={takedownNote}
                  onChange={(e) => setTakedownNote(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTakedownPhoto(null)}
                disabled={isSubmittingTakedown}
                className="cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmittingTakedown}
                className="cursor-pointer"
              >
                {isSubmittingTakedown ? "Đang gửi..." : "Gửi Yêu Cầu Gỡ Ảnh"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
