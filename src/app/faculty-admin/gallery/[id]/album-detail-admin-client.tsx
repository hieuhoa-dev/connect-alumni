"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Archive,
  Trash2,
  ExternalLink,
  Edit2,
  Star,
  EyeOff,
  MoveUp,
  MoveDown,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BatchFileUploader } from "@/components/shared/batch-file-uploader";
import {
  uploadAlbumPhotos,
  reorderAlbumPhotos,
  updatePhotoCaption,
  removePhoto,
  setAlbumCover,
  publishAlbum,
  archiveAlbum,
  updateAlbum,
} from "@/actions/gallery-actions";
import { toast } from "@/components/ui/toast";

interface AlbumInfo {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  publishedAt: Date | null;
  eventId: string | null;
  coverPhotoId: string | null;
  eventTitle?: string | null;
}

interface PhotoItem {
  id: string;
  albumId: string;
  fileId: string;
  fileKey: string;
  caption: string | null;
  takenAt: Date | null;
  sortOrder: number;
  status: "published" | "removed";
  removedReason: string | null;
  thumbUrl: string;
  fullUrl: string;
}

interface AlbumDetailAdminClientProps {
  album: AlbumInfo;
  initialPhotos: PhotoItem[];
}

export const AlbumDetailAdminClient = ({
  album,
  initialPhotos,
}: AlbumDetailAdminClientProps) => {
  const router = useRouter();
  const [photos, setPhotos] = React.useState<PhotoItem[]>(initialPhotos);

  // Batch upload state
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [uploadedFileIds, setUploadedFileIds] = React.useState<string[]>([]);
  const [isSavingPhotos, setIsSavingPhotos] = React.useState(false);

  // Edit album modal state
  const [isEditAlbumOpen, setIsEditAlbumOpen] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(album.title);
  const [editDesc, setEditDesc] = React.useState(album.description || "");

  // Caption modal state
  const [editingPhoto, setEditingPhoto] = React.useState<PhotoItem | null>(null);
  const [captionText, setCaptionText] = React.useState("");

  // Remove photo modal state
  const [removingPhoto, setRemovingPhoto] = React.useState<PhotoItem | null>(null);
  const [removeReason, setRemoveReason] = React.useState("");

  React.useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  const handleBatchUploadComplete = async () => {
    if (uploadedFileIds.length === 0) {
      toast.error("Vui lòng tải lên ít nhất một ảnh.");
      return;
    }

    setIsSavingPhotos(true);
    try {
      const res = await uploadAlbumPhotos(album.id, uploadedFileIds);
      if (!res.success) {
        toast.error(res.error || "Không thể thêm ảnh vào album");
        return;
      }

      toast.success(`Đã thêm thành công ${res.count} ảnh vào album!`);
      setUploadedFileIds([]);
      setIsUploadOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu ảnh");
    } finally {
      setIsSavingPhotos(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(index, 1);
    newPhotos.splice(targetIndex, 0, moved);

    setPhotos(newPhotos);
    const photoIds = newPhotos.map((p) => p.id);
    const res = await reorderAlbumPhotos(album.id, photoIds);
    if (!res.success) {
      toast.error(res.error || "Không thể lưu thứ tự ảnh");
      setPhotos(initialPhotos);
    }
  };

  const handleSaveCaption = async () => {
    if (!editingPhoto) return;
    const res = await updatePhotoCaption(editingPhoto.id, captionText);
    if (res.success) {
      toast.success("Đã cập nhật chú thích ảnh.");
      setEditingPhoto(null);
      router.refresh();
    } else {
      toast.error(res.error || "Không thể cập nhật chú thích");
    }
  };

  const handleConfirmRemovePhoto = async () => {
    if (!removingPhoto) return;
    const res = await removePhoto(
      removingPhoto.id,
      removeReason || "Quản trị viên gỡ ảnh",
    );
    if (res.success) {
      toast.success("Đã gỡ ảnh khỏi album công khai.");
      setRemovingPhoto(null);
      setRemoveReason("");
      router.refresh();
    } else {
      toast.error(res.error || "Không thể gỡ ảnh");
    }
  };

  const handleSetCover = async (photoId: string) => {
    const res = await setAlbumCover(album.id, photoId);
    if (res.success) {
      toast.success("Đã đặt ảnh này làm ảnh bìa album!");
      router.refresh();
    } else {
      toast.error(res.error || "Không thể đặt ảnh bìa");
    }
  };

  const handlePublishToggle = async () => {
    if (album.status === "published") {
      const res = await archiveAlbum(album.id);
      if (res.success) {
        toast.success("Đã chuyển album vào mục lưu trữ.");
        router.refresh();
      } else {
        toast.error(res.error || "Không thể lưu trữ album");
      }
    } else {
      const res = await publishAlbum(album.id);
      if (res.success) {
        toast.success("Đã xuất bản album ra thư viện công khai!");
        router.refresh();
      } else {
        toast.error(res.error || "Không thể xuất bản album");
      }
    }
  };

  const handleUpdateAlbumInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateAlbum(album.id, {
      title: editTitle,
      description: editDesc,
    });
    if (res.success) {
      toast.success("Đã cập nhật thông tin album.");
      setIsEditAlbumOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || "Không thể cập nhật thông tin");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top navigation & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <Link
            href="/faculty-admin/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại danh sách Album
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {album.title}
            </h1>
            <Badge
              variant={album.status === "published" ? "default" : "secondary"}
              className="text-xs"
            >
              {album.status === "published"
                ? "Đã xuất bản"
                : album.status === "draft"
                ? "Bản nháp"
                : "Lưu trữ"}
            </Badge>
          </div>

          {album.description && (
            <p className="text-sm text-muted-foreground max-w-2xl">
              {album.description}
            </p>
          )}

          {album.eventTitle && (
            <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
              <Calendar className="size-3.5" />
              Sự kiện: {album.eventTitle}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditAlbumOpen(true)}
            className="cursor-pointer"
          >
            <Edit2 className="size-3.5 mr-1" />
            Sửa Album
          </Button>

          {album.status === "published" && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/gallery/${album.id}`} target="_blank" />}
              className="cursor-pointer"
            >
              <ExternalLink className="size-3.5 mr-1" />
              Xem Trang Công Khai
            </Button>
          )}

          <Button
            variant={album.status === "published" ? "secondary" : "default"}
            size="sm"
            onClick={handlePublishToggle}
            className="cursor-pointer"
          >
            {album.status === "published" ? (
              <>
                <Archive className="size-3.5 mr-1" />
                Lưu Trữ
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3.5 mr-1" />
                Xuất Bản Album
              </>
            )}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="cursor-pointer"
          >
            <Upload className="size-3.5 mr-1" />
            Tải Thêm Ảnh (Tối đa 30)
          </Button>
        </div>
      </div>

      {/* Photos Count Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-4 py-2.5 rounded-lg border border-border">
        <span className="font-medium">
          Tổng cộng:{" "}
          <strong className="text-foreground">{photos.length}</strong> ảnh trong album
        </span>
        <span>
          Gợi ý: Nhấn mũi tên lên/xuống để đổi thứ tự ảnh, hoặc bấm biểu tượng ngôi sao để chọn ảnh bìa album.
        </span>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/40">
          <ImageIcon className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="font-bold text-base text-foreground">Album chưa có ảnh</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Nhấn "Tải Thêm Ảnh" để kéo thả tải lên tối đa 30 bức ảnh kỷ niệm cho album này.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="mt-4 cursor-pointer"
          >
            <Upload className="size-4 mr-1.5" />
            Tải Ảnh Ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo, idx) => {
            const isCover = album.coverPhotoId === photo.id;
            const isRemoved = photo.status === "removed";

            return (
              <div
                key={photo.id}
                className={`group relative rounded-xl border overflow-hidden bg-card transition-all flex flex-col justify-between ${
                  isRemoved
                    ? "border-destructive/40 opacity-60 bg-destructive/5"
                    : isCover
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:shadow-md"
                }`}
              >
                {/* Photo Preview */}
                <div className="relative aspect-square w-full bg-muted overflow-hidden">
                  <Image
                    src={photo.thumbUrl}
                    alt={photo.caption || "Ảnh album"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  />

                  {/* Cover badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <Star className="size-3 fill-current" />
                      Ảnh Bìa
                    </div>
                  )}

                  {/* Removed badge */}
                  {isRemoved && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-destructive text-destructive-foreground text-[10px] font-bold shadow-xs">
                      Đã Gỡ
                    </div>
                  )}

                  {/* Reorder buttons */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-xs p-1 rounded-md border border-border">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, "up")}
                      className="size-6 rounded hover:bg-muted disabled:opacity-30 flex items-center justify-center cursor-pointer text-foreground"
                      title="Chuyển lên trước"
                    >
                      <MoveUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === photos.length - 1}
                      onClick={() => handleMoveOrder(idx, "down")}
                      className="size-6 rounded hover:bg-muted disabled:opacity-30 flex items-center justify-center cursor-pointer text-foreground"
                      title="Chuyển xuống sau"
                    >
                      <MoveDown className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info & quick controls */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>#{idx + 1}</span>
                      <span>{new Date(photo.takenAt || album.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>

                    <p className="text-xs text-foreground mt-1 line-clamp-2 min-h-[32px]">
                      {photo.caption || (
                        <span className="text-muted-foreground italic">Chưa có chú thích</span>
                      )}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPhoto(photo);
                        setCaptionText(photo.caption || "");
                      }}
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                    >
                      Sửa chú thích
                    </button>

                    <div className="flex items-center gap-1">
                      {!isCover && !isRemoved && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(photo.id)}
                          title="Đặt làm ảnh bìa"
                          className="size-7 rounded hover:bg-muted text-muted-foreground hover:text-amber-500 flex items-center justify-center cursor-pointer"
                        >
                          <Star className="size-3.5" />
                        </button>
                      )}

                      {!isRemoved && (
                        <button
                          type="button"
                          onClick={() => {
                            setRemovingPhoto(photo);
                            setRemoveReason("");
                          }}
                          title="Gỡ ảnh khỏi album"
                          className="size-7 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center cursor-pointer"
                        >
                          <EyeOff className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tải Ảnh Hàng Loạt */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="size-5 text-primary" />
              Tải Ảnh Hàng Loạt Vào Album
            </DialogTitle>
            <DialogDescription>
              Chọn hoặc kéo thả tối đa 30 file ảnh (JPEG, PNG, WebP). Hệ thống sẽ tự động tối ưu và tạo các phiên bản xem nhanh.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <BatchFileUploader
              purpose="album_photo"
              maxFiles={30}
              onUploadedChange={(items) => {
                setUploadedFileIds(items.map((it) => it.fileId));
              }}
            />

            {uploadedFileIds.length > 0 && (
              <p className="text-xs font-semibold text-emerald-600">
                Đã sẵn sàng thêm {uploadedFileIds.length} ảnh vào album.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUploadOpen(false);
                setUploadedFileIds([]);
              }}
              disabled={isSavingPhotos}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleBatchUploadComplete}
              disabled={isSavingPhotos || uploadedFileIds.length === 0}
              className="cursor-pointer"
            >
              {isSavingPhotos ? "Đang lưu ảnh..." : `Lưu ${uploadedFileIds.length} ảnh vào Album`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Sửa Chú Thích */}
      <Dialog open={!!editingPhoto} onOpenChange={(open) => !open && setEditingPhoto(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa Chú Thích Ảnh</DialogTitle>
            <DialogDescription>
              Chú thích sẽ xuất hiện ở góc dưới ảnh khi người xem mở chế độ phóng to (Lightbox).
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="text-xs font-semibold text-foreground">Chú thích</label>
            <Input
              placeholder="Nhập chú thích mô tả khoảnh khắc trong ảnh..."
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingPhoto(null)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              variant="default"
              onClick={handleSaveCaption}
              className="cursor-pointer"
            >
              Lưu Chú Thích
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Gỡ Ảnh */}
      <Dialog open={!!removingPhoto} onOpenChange={(open) => !open && setRemovingPhoto(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <EyeOff className="size-5" />
              Gỡ Ảnh Khỏi Thư Viện Công Khai
            </DialogTitle>
            <DialogDescription>
              Ảnh sẽ được ẩn khỏi toàn bộ giao diện công khai và ghi vào nhật ký kiểm toán.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Lý do gỡ ảnh <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Ví dụ: Theo yêu cầu cá nhân trong ảnh / Ảnh mờ chất lượng kém..."
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemovingPhoto(null)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRemovePhoto}
              className="cursor-pointer"
            >
              Xác Nhận Gỡ Ảnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Sửa Thông Tin Album */}
      <Dialog open={isEditAlbumOpen} onOpenChange={setIsEditAlbumOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdateAlbumInfo} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Sửa Thông Tin Album</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Tiêu đề Album</label>
                <Input
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Mô tả Album</label>
                <Input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditAlbumOpen(false)}
                className="cursor-pointer"
              >
                Hủy
              </Button>
              <Button type="submit" variant="default" className="cursor-pointer">
                Lưu Thay Đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
