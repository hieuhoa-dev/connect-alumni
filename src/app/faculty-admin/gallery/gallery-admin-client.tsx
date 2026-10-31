"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Image as ImageIcon,
  Calendar,
  Eye,
  Archive,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
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
import {
  createAlbum,
  publishAlbum,
  archiveAlbum,
  deleteAlbum,
} from "@/actions/gallery-actions";
import { toast } from "@/components/ui/toast";

interface AlbumRow {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  publishedAt: Date | null;
  eventId: string | null;
  eventTitle?: string | null;
  createdByName?: string | null;
  photoCount: number;
}

interface EventOption {
  id: string;
  title: string;
  startTime: Date;
}

interface GalleryAdminClientProps {
  initialAlbums: AlbumRow[];
  availableEvents: EventOption[];
}

export const GalleryAdminClient = ({
  initialAlbums,
  availableEvents,
}: GalleryAdminClientProps) => {
  const router = useRouter();
  const [albums, setAlbums] = React.useState<AlbumRow[]>(initialAlbums);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createTitle, setCreateTitle] = React.useState("");
  const [createDesc, setCreateDesc] = React.useState("");
  const [createEventId, setCreateEventId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Sync initialAlbums when router refreshes
  React.useEffect(() => {
    setAlbums(initialAlbums);
  }, [initialAlbums]);

  const filteredAlbums = albums.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(search.toLowerCase())) ||
      (a.eventTitle && a.eventTitle.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề album");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAlbum({
        title: createTitle,
        description: createDesc || undefined,
        eventId: createEventId || undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Không thể tạo album");
        return;
      }

      toast.success("Tạo album thành công! Đang chuyển đến trang quản lý ảnh...");
      setIsCreateOpen(false);
      setCreateTitle("");
      setCreateDesc("");
      setCreateEventId("");
      if (res.data) {
        router.push(`/faculty-admin/gallery/${res.data.id}`);
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra khi tạo album");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (id: string) => {
    const res = await publishAlbum(id);
    if (res.success) {
      toast.success("Đã xuất bản album ra thư viện công khai!");
      router.refresh();
    } else {
      toast.error(res.error || "Không thể xuất bản album");
    }
  };

  const handleArchive = async (id: string) => {
    const res = await archiveAlbum(id);
    if (res.success) {
      toast.success("Đã chuyển album vào mục lưu trữ.");
      router.refresh();
    } else {
      toast.error(res.error || "Không thể lưu trữ album");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn album "${title}" và toàn bộ ảnh thuộc album?`)) {
      return;
    }
    const res = await deleteAlbum(id);
    if (res.success) {
      toast.success("Đã xóa album.");
      router.refresh();
    } else {
      toast.error(res.error || "Không thể xóa album");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ImageIcon className="size-6 text-primary" />
            Quản Lý Thư Viện Ảnh (Gallery)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lưu giữ và phát hành tư liệu truyền thông, hoạt động phong trào và lễ tốt nghiệp của Khoa CNTT
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/gallery" target="_blank" />}
            className="cursor-pointer"
          >
            <Eye className="size-4 mr-1.5" />
            Xem Thư viện Công khai
          </Button>

          <Button
            variant="default"
            onClick={() => setIsCreateOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="size-4 mr-1.5" />
            Tạo Album Mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tiêu đề, mô tả hoặc tên sự kiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Bản nháp (Draft)</option>
            <option value="published">Đã phát hành (Published)</option>
            <option value="archived">Lưu trữ (Archived)</option>
          </select>
        </div>
      </div>

      {/* Albums List */}
      {filteredAlbums.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
          <ImageIcon className="size-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          <h3 className="font-bold text-base text-foreground">Chưa có album nào</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Hãy bắt đầu bằng việc tạo một album ảnh mới cho các sự kiện, lễ tốt nghiệp hoặc hoạt động của Khoa.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 cursor-pointer"
          >
            <Plus className="size-4 mr-1.5" />
            Tạo Album Đầu Tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAlbums.map((album) => {
            const isDraft = album.status === "draft";
            const isPublished = album.status === "published";
            const isArchived = album.status === "archived";

            return (
              <div
                key={album.id}
                className="rounded-xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant={isPublished ? "default" : isDraft ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {isPublished
                        ? "Đã xuất bản"
                        : isDraft
                        ? "Bản nháp"
                        : "Lưu trữ"}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {album.photoCount} ảnh
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground text-base line-clamp-1">
                      {album.title}
                    </h3>
                    {album.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {album.description}
                      </p>
                    )}
                  </div>

                  {album.eventTitle && (
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/5 p-2 rounded-lg border border-primary/10">
                      <Calendar className="size-3.5 shrink-0" />
                      <span className="truncate">{album.eventTitle}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    Tạo ngày: {new Date(album.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/faculty-admin/gallery/${album.id}`} />}
                    className="flex-1 justify-center cursor-pointer"
                  >
                    Quản Lý Ảnh
                    <ChevronRight className="size-3.5 ml-1" />
                  </Button>

                  {isPublished ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(album.id)}
                      title="Chuyển vào lưu trữ"
                      className="cursor-pointer"
                    >
                      <Archive className="size-3.5 text-muted-foreground" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePublish(album.id)}
                      title="Xuất bản album ra công khai"
                      className="cursor-pointer text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="size-3.5" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(album.id, album.title)}
                    title="Xóa album"
                    className="cursor-pointer text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tạo Album Mới */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateAlbum} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ImageIcon className="size-5 text-primary" />
                Tạo Album Ảnh Mới
              </DialogTitle>
              <DialogDescription>
                Nhập tiêu đề và chọn sự kiện liên kết (nếu có). Sau khi tạo, bạn có thể tải lên hàng loạt tối đa 30 ảnh.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Tiêu đề Album <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  placeholder="Ví dụ: Lễ Tốt nghiệp Khoa CNTT Khóa 44"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Mô tả ngắn
                </label>
                <Input
                  placeholder="Ví dụ: Khoảnh khắc nhận bằng tốt nghiệp của các tân cử nhân..."
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Liên kết Sự kiện (Tùy chọn)
                </label>
                <select
                  value={createEventId}
                  onChange={(e) => setCreateEventId(e.target.value)}
                  className="w-full h-9 px-3 mt-1 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">-- Không liên kết sự kiện --</option>
                  {availableEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({new Date(ev.startTime).toLocaleDateString("vi-VN")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo & Tải Ảnh"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
