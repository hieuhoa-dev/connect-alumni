"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Monitor,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  useAdminHeroSlides,
  useCreateHeroSlide,
  useUpdateHeroSlide,
  useDeleteHeroSlide,
  useToggleHeroSlideStatus,
  useReorderHeroSlides,
} from "@/hooks/use-hero";
import type { HeroSlideInput, AdminHeroSlideRow } from "@/actions/hero-actions";
import {
  type HeroSlideData,
  HeroSlideView,
} from "@/components/landing/hero-slide-view";
import { FileUploader } from "@/components/shared/file-uploader";
import { LinkPicker } from "@/components/shared/link-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { getPublicFileUrl } from "@/lib/file-url";
import { cn } from "@/lib/utils";

interface HeroManagementClientProps {
  initialSlides: AdminHeroSlideRow[];
}

const SortableSlideItem = ({
  item,
  onEdit,
  onToggleStatus,
  onDelete,
  isToggling = false,
  isDeleting = false,
}: {
  item: AdminHeroSlideRow;
  onEdit: (item: AdminHeroSlideRow) => void;
  onToggleStatus: (id: string, currentStatus: "draft" | "published") => void;
  onDelete: (id: string) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
  };

  const now = new Date();
  const startsAt = item.slide.startsAt ? new Date(item.slide.startsAt) : null;
  const endsAt = item.slide.endsAt ? new Date(item.slide.endsAt) : null;

  let computedStatus: "draft" | "live" | "scheduled" | "expired" =
    item.slide.status === "draft" ? "draft" : "live";

  if (item.slide.status === "published") {
    if (startsAt && startsAt > now) {
      computedStatus = "scheduled";
    } else if (endsAt && endsAt <= now) {
      computedStatus = "expired";
    }
  }

  const thumbUrl = item.imageFile
    ? getPublicFileUrl(item.imageFile, "thumb")
    : "/placeholder-cover.svg";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-xs group"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
        aria-label="Kéo thả để sắp xếp vị trí"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Thumbnail */}
      <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-muted border shrink-0">
        <img
          src={thumbUrl}
          alt={item.slide.imageAlt || "Banner slide"}
          className="w-full h-full object-cover"
        />
        {item.slide.overlayEnabled && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-[10px] text-white font-mono">
            Scrim
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          {computedStatus === "live" && (
            <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-600/20 text-[10px]">
              Đang hiển thị
            </Badge>
          )}
          {computedStatus === "draft" && (
            <Badge
              variant="outline"
              className="text-muted-foreground text-[10px]"
            >
              Bản nháp
            </Badge>
          )}
          {computedStatus === "scheduled" && (
            <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/20 text-[10px]">
              Hẹn giờ đăng
            </Badge>
          )}
          {computedStatus === "expired" && (
            <Badge className="bg-amber-600/10 text-amber-600 border-amber-600/20 text-[10px]">
              Đã hết hạn
            </Badge>
          )}

          {item.slide.badge && (
            <span className="text-[11px] font-mono text-muted-foreground truncate">
              {item.slide.badge}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-foreground truncate">
          {item.slide.title || "Slide không có tiêu đề chữ"}
        </h3>

        <p className="text-xs text-muted-foreground truncate">
          Alt: {item.slide.imageAlt}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          disabled={isToggling || isDeleting}
          onClick={() => onToggleStatus(item.slide.id, item.slide.status)}
          className="h-8 gap-1 text-xs"
        >
          {isToggling ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : item.slide.status === "published" ? (
            <>
              <EyeOff className="size-3.5" />
              <span>Gỡ slide</span>
            </>
          ) : (
            <>
              <Eye className="size-3.5 text-emerald-600" />
              <span>Đăng ngay</span>
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          disabled={isDeleting || isToggling}
          className="h-8 w-8 p-0"
        >
          <Edit className="size-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={isDeleting || isToggling}
          onClick={() => onDelete(item.slide.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          {isDeleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export const HeroManagementClient = ({
  initialSlides,
}: HeroManagementClientProps) => {
  const router = useRouter();

  const {
    data: slides = [],
    isLoading,
    isFetching,
  } = useAdminHeroSlides(initialSlides);

  const createMutation = useCreateHeroSlide();
  const updateMutation = useUpdateHeroSlide();
  const deleteMutation = useDeleteHeroSlide();
  const toggleStatusMutation = useToggleHeroSlideStatus();
  const reorderMutation = useReorderHeroSlides();

  // Local state for smooth drag & drop reordering
  const [items, setItems] = React.useState<AdminHeroSlideRow[]>(slides);

  // Sync local items whenever query data updates (create, update, delete, refetch)
  React.useEffect(() => {
    setItems(slides);
  }, [slides]);

  const [isOpenModal, setIsOpenModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Form State
  const [title, setTitle] = React.useState("");
  const [badge, setBadge] = React.useState("");
  const [highlightText, setHighlightText] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [primaryLabel, setPrimaryLabel] = React.useState("");
  const [primaryHref, setPrimaryHref] = React.useState("");
  const [secondaryLabel, setSecondaryLabel] = React.useState("");
  const [secondaryHref, setSecondaryHref] = React.useState("");
  const [linkHref, setLinkHref] = React.useState("");
  const [imageFileId, setImageFileId] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageMobileFileId, setImageMobileFileId] = React.useState("");
  const [imageMobileUrl, setImageMobileUrl] = React.useState("");
  const [imageAlt, setImageAlt] = React.useState("");
  const [overlayEnabled, setOverlayEnabled] = React.useState(true);
  const [startsAt, setStartsAt] = React.useState("");
  const [endsAt, setEndsAt] = React.useState("");
  const [status, setStatus] = React.useState<"draft" | "published">(
    "published",
  );

  // Preview Mode
  const [previewDevice, setPreviewDevice] = React.useState<
    "desktop" | "mobile"
  >("desktop");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBadge("");
    setHighlightText("");
    setDescription("");
    setPrimaryLabel("");
    setPrimaryHref("");
    setSecondaryLabel("");
    setSecondaryHref("");
    setLinkHref("");
    setImageFileId("");
    setImageUrl("");
    setImageMobileFileId("");
    setImageMobileUrl("");
    setImageAlt("");
    setOverlayEnabled(true);
    setStartsAt("");
    setEndsAt("");
    setStatus("published");
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsOpenModal(true);
  };

  const handleEdit = (item: AdminHeroSlideRow) => {
    setEditingId(item.slide.id);
    setTitle(item.slide.title || "");
    setBadge(item.slide.badge || "");
    setHighlightText(item.slide.highlightText || "");
    setDescription(item.slide.description || "");
    setPrimaryLabel(item.slide.primaryLabel || "");
    setPrimaryHref(item.slide.primaryHref || "");
    setSecondaryLabel(item.slide.secondaryLabel || "");
    setSecondaryHref(item.slide.secondaryHref || "");
    setLinkHref(item.slide.linkHref || "");
    setImageFileId(item.slide.imageFileId);
    setImageUrl(
      item.imageFile
        ? getPublicFileUrl(item.imageFile)
        : "/placeholder-cover.svg",
    );
    setImageMobileFileId(item.slide.imageMobileFileId || "");
    setImageMobileUrl("");
    setImageAlt(item.slide.imageAlt);
    setOverlayEnabled(item.slide.overlayEnabled);
    setStartsAt(
      item.slide.startsAt
        ? new Date(item.slide.startsAt).toISOString().slice(0, 16)
        : "",
    );
    setEndsAt(
      item.slide.endsAt
        ? new Date(item.slide.endsAt).toISOString().slice(0, 16)
        : "",
    );
    setStatus(item.slide.status);
    setIsOpenModal(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((s) => s.slide.id === active.id);
    const newIndex = items.findIndex((s) => s.slide.id === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    const slideIds = reordered.map((s) => s.slide.id);
    reorderMutation.mutate(slideIds);
  };

  const handleToggleStatus = (
    id: string,
    currentStatus: "draft" | "published",
  ) => {
    toggleStatusMutation.mutate({ id, currentStatus });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa slide banner này?")) return;
    deleteMutation.mutate(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFileId) {
      toast.error("Vui lòng tải lên ảnh banner chính.");
      return;
    }
    if (!imageAlt || imageAlt.trim().length < 5) {
      toast.error("Mô tả ảnh bắt buộc ít nhất 5 ký tự.");
      return;
    }

    const payload: HeroSlideInput = {
      title: title.trim() || null,
      badge: badge.trim() || null,
      highlightText: highlightText.trim() || null,
      description: description.trim() || null,
      primaryLabel: primaryLabel.trim() || null,
      primaryHref: primaryHref.trim() || null,
      secondaryLabel: secondaryLabel.trim() || null,
      secondaryHref: secondaryHref.trim() || null,
      linkHref: linkHref.trim() || null,
      imageFileId,
      imageMobileFileId: imageMobileFileId || null,
      imageAlt: imageAlt.trim(),
      overlayEnabled,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      status,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, input: payload },
        {
          onSuccess: (res) => {
            if (res.success) {
              setIsOpenModal(false);
              resetForm();
            }
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (res) => {
          if (res.success) {
            setIsOpenModal(false);
            resetForm();
          }
        },
      });
    }
  };

  // Construct preview slide DTO
  const previewSlideData: HeroSlideData = {
    id: "preview",
    title: title || null,
    badge: badge || null,
    highlightText: highlightText || null,
    description: description || null,
    primaryAction:
      primaryLabel && primaryHref
        ? { label: primaryLabel, href: primaryHref }
        : null,
    secondaryAction:
      secondaryLabel && secondaryHref
        ? { label: secondaryLabel, href: secondaryHref }
        : null,
    linkHref: linkHref || null,
    image: {
      src: imageUrl || "/placeholder-cover.svg",
      mobileSrc: imageMobileUrl || null,
      alt: imageAlt || "Xem trước banner",
    },
    overlayEnabled,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">
              Quản lý Banner Trang chủ
            </h2>
            {isFetching && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                <Loader2 className="size-3 animate-spin text-primary" />
                <span>Đang đồng bộ...</span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tối đa 8 slide được hiển thị đồng thời. Kéo thả để sắp xếp thứ tự
            hiển thị.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          <span>Thêm slide banner mới</span>
        </Button>
      </div>

      {/* Drag & Drop Slides List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((s) => s.slide.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {isLoading ? (
              <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card">
                <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  Đang tải danh sách banner...
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card">
                <p className="text-sm text-muted-foreground">
                  Chưa có slide banner nào. Nhấn &quot;Thêm slide banner
                  mới&quot; để tạo.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <SortableSlideItem
                  key={item.slide.id}
                  item={item}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  isToggling={
                    toggleStatusMutation.isPending &&
                    toggleStatusMutation.variables?.id === item.slide.id
                  }
                  isDeleting={
                    deleteMutation.isPending &&
                    deleteMutation.variables === item.slide.id
                  }
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Slide Modal Editor */}
      <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
        <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[92vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Chỉnh sửa slide banner" : "Thêm mới slide banner"}
            </DialogTitle>
            <DialogDescription>
              Các trường chữ và nút bấm đều là tùy chọn. Người dùng có thể
              bật/tắt lớp phủ linh hoạt.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* Live Preview Box */}
            <div className="border rounded-xl p-4 bg-muted/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bản xem trước trực tiếp
                </span>
                <div className="flex items-center gap-1 bg-background border rounded-lg p-0.5">
                  <Button
                    type="button"
                    variant={previewDevice === "desktop" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewDevice("desktop")}
                    className="h-7 text-xs gap-1 px-2.5"
                  >
                    <Monitor className="size-3.5" />
                    <span>Desktop</span>
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === "mobile" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewDevice("mobile")}
                    className="h-7 text-xs gap-1 px-2.5"
                  >
                    <Smartphone className="size-3.5" />
                    <span>Điện thoại</span>
                  </Button>
                </div>
              </div>

              <div
                className={cn(
                  "overflow-hidden rounded-xl border bg-black transition-all mx-auto shadow-xs",
                  previewDevice === "desktop"
                    ? "w-full"
                    : "w-[280px] max-w-full",
                )}
              >
                <HeroSlideView
                  slide={previewSlideData}
                  isMobilePreview={previewDevice === "mobile"}
                  previewMode={true}
                />
              </div>
            </div>

            {/* Upload Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUploader
                label="Ảnh Banner Desktop *"
                purpose="hero_banner"
                value={{
                  fileId: imageFileId || undefined,
                  url: imageUrl || undefined,
                }}
                onChange={(val) => {
                  setImageFileId(val?.fileId || "");
                  setImageUrl(val?.url || "");
                }}
                helperText="Gợi ý tỉ lệ 21:9 hoặc 16:9 (2100×900 px, tối đa 8MB)"
              />

              <FileUploader
                label="Ảnh Banner Riêng cho Điện thoại (tùy chọn)"
                purpose="hero_banner"
                value={{
                  fileId: imageMobileFileId || undefined,
                  url: imageMobileUrl || undefined,
                }}
                onChange={(val) => {
                  setImageMobileFileId(val?.fileId || "");
                  setImageMobileUrl(val?.url || "");
                }}
                helperText="Gợi ý tỉ lệ 4:5 hoặc 9:16 (1080×1350 px, tối đa 8MB)"
              />
            </div>

            {/* Alt & Overlay Switch */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium">
                  Mô tả ảnh cho người khiếm thị (Alt text) *
                </Label>
                <Input
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Ví dụ: Lễ hội kỷ niệm 50 năm thành lập Trường Đại học Đà Lạt"
                  required
                  className="text-xs"
                />
              </div>

              <div className="border rounded-lg p-3 bg-card space-y-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="overlay"
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Bật lớp phủ & Scrim
                  </Label>
                  <Switch
                    id="overlay"
                    checked={overlayEnabled}
                    onCheckedChange={setOverlayEnabled}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {overlayEnabled
                    ? "Bật: Scrim & gradient giúp đọc chữ rõ, kèm zoom nhẹ."
                    : "Tắt: Hiển thị ảnh gốc, không che phủ."}
                </p>
              </div>
            </div>

            {/* Text fields (optional) */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nội dung chữ trên slide (Tùy chọn)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">
                    Huy hiệu (Badge)
                  </Label>
                  <Input
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="TRƯỜNG ĐẠI HỌC ĐÀ LẠT · KHOA CNTT"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">
                    Dòng nhấn (Highlight)
                  </Label>
                  <Input
                    value={highlightText}
                    onChange={(e) => setHighlightText(e.target.value)}
                    placeholder="Nơi hội tụ, tri ân và tiếp bước tương lai"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">
                  Tiêu đề chính (Title)
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mừng bạn trở về nhà!"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">
                  Đoạn văn mô tả (Description)
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả tóm tắt sự kiện hoặc thông điệp..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Buttons & Links */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nút hành động &amp; Liên kết (Tùy chọn)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 border rounded-lg p-3 bg-card">
                  <Label className="text-xs font-semibold">Nút chính</Label>
                  <Input
                    value={primaryLabel}
                    onChange={(e) => setPrimaryLabel(e.target.value)}
                    placeholder="Nhãn nút (Ví dụ: Đăng ký ngay)"
                    className="text-xs"
                  />
                  <LinkPicker
                    value={primaryHref}
                    onChange={setPrimaryHref}
                    label="Đích đến nút chính"
                  />
                </div>

                <div className="space-y-2 border rounded-lg p-3 bg-card">
                  <Label className="text-xs font-semibold">Nút phụ</Label>
                  <Input
                    value={secondaryLabel}
                    onChange={(e) => setSecondaryLabel(e.target.value)}
                    placeholder="Nhãn nút (Ví dụ: Xem chi tiết)"
                    className="text-xs"
                  />
                  <LinkPicker
                    value={secondaryHref}
                    onChange={setSecondaryHref}
                    label="Đích đến nút phụ"
                  />
                </div>
              </div>

              <LinkPicker
                value={linkHref}
                onChange={setLinkHref}
                label="Liên kết bấm toàn slide (chỉ dùng khi không có nút chính/phụ)"
              />
            </div>

            {/* Scheduling & Status */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Thời gian hiển thị &amp; Trạng thái
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">
                    Bắt đầu hiển thị
                  </Label>
                  <Input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">
                    Kết thúc hiển thị
                  </Label>
                  <Input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">
                    Trạng thái xuất bản
                  </Label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "draft" | "published")
                    }
                    className="w-full text-xs h-9 rounded-lg border border-input bg-background px-3"
                  >
                    <option value="published">Đã xuất bản (Published)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpenModal(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                <span>{editingId ? "Lưu thay đổi" : "Tạo slide"}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
