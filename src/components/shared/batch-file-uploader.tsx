"use client";

import * as React from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type UploadPurpose, UPLOAD_POLICIES } from "@/lib/upload-policy";
import Image from "next/image";

export interface BatchUploadedItem {
  fileId: string;
  url: string;
  name: string;
}

interface BatchFileUploaderProps {
  purpose: UploadPurpose;
  maxFiles?: number;
  onUploadedChange: (files: BatchUploadedItem[]) => void;
  disabled?: boolean;
}

interface FileItemState {
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  fileId?: string;
  url?: string;
}

export const BatchFileUploader = ({
  purpose,
  maxFiles = 30,
  onUploadedChange,
  disabled = false,
}: BatchFileUploaderProps) => {
  const [items, setItems] = React.useState<FileItemState[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const policy = UPLOAD_POLICIES[purpose];

  const uploadSingleFile = async (item: FileItemState): Promise<FileItemState> => {
    try {
      // 1. Presign
      const presignRes = await fetch("/api/v1/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: item.file.type,
          size: item.file.size,
          purpose,
        }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({}));
        throw new Error(data.error || "Không thể khởi tạo liên kết tải ảnh.");
      }

      const { uploadUrl, fileId, key, fileUrl } = await presignRes.json();

      // 2. Direct upload to S3/MinIO
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": item.file.type },
        body: item.file,
      });

      if (!uploadRes.ok) {
        throw new Error("Không thể tải ảnh lên kho lưu trữ.");
      }

      // 3. Confirm & Sharp processing
      const confirmRes = await fetch("/api/v1/uploads/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, key }),
      });

      if (!confirmRes.ok) {
        const confirmData = await confirmRes.json().catch(() => ({}));
        throw new Error(confirmData.error || "Lỗi xử lý ảnh.");
      }

      const confirmData = await confirmRes.json();

      return {
        ...item,
        status: "done",
        progress: 100,
        fileId: confirmData.fileId || fileId,
        url: confirmData.fileUrl || fileUrl,
      };
    } catch (err: any) {
      return {
        ...item,
        status: "error",
        error: err?.message || "Lỗi tải ảnh.",
      };
    }
  };

  const handleFiles = async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    if (fileArray.length === 0) return;

    const availableSlots = maxFiles - items.length;
    const allowedFiles = fileArray.slice(0, availableSlots);

    const newItems: FileItemState[] = allowedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      status: "uploading",
      progress: 20,
    }));

    setItems((prev) => [...prev, ...newItems]);

    // Upload items sequentially / batch 3 at a time to prevent server spikes
    for (let i = 0; i < newItems.length; i++) {
      const updated = await uploadSingleFile(newItems[i]);
      setItems((prev) => {
        const next = [...prev];
        const idx = next.findIndex((p) => p.previewUrl === updated.previewUrl);
        if (idx !== -1) {
          next[idx] = updated;
        }
        return next;
      });
    }
  };

  // Notify parent of all done items
  React.useEffect(() => {
    const doneItems = items
      .filter((it) => it.status === "done" && it.fileId && it.url)
      .map((it) => ({
        fileId: it.fileId!,
        url: it.url!,
        name: it.file.name,
      }));
    onUploadedChange(doneItems);
  }, [items, onUploadedChange]);

  const handleRemove = (index: number) => {
    setItems((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled && e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => {
          if (!disabled && inputRef.current) {
            inputRef.current.click();
          }
        }}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={policy.allowedMimeTypes.join(",")}
          multiple
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
            }
          }}
          className="hidden"
        />

        <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-semibold text-foreground">
          Kéo thả hoặc nhấp để chọn ảnh (Tối đa {maxFiles} ảnh)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Hỗ trợ định dạng JPEG, PNG, WebP (Tối đa {policy.maxSizeBytes / (1024 * 1024)}MB / ảnh)
        </p>
      </div>

      {/* Progress list */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
          {items.map((item, idx) => (
            <div
              key={`${item.previewUrl}-${idx}`}
              className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center group"
            >
              <Image
                src={item.previewUrl}
                alt={item.file.name}
                fill
                className="object-cover"
              />

              {item.status === "uploading" && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                  <Loader2 className="size-5 animate-spin mb-1 text-primary" />
                  <span className="text-[10px] font-mono">Đang tải...</span>
                </div>
              )}

              {item.status === "done" && (
                <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                  <CheckCircle className="size-3" />
                </div>
              )}

              {item.status === "error" && (
                <div className="absolute inset-0 bg-destructive/80 flex flex-col items-center justify-center text-white p-1 text-center">
                  <AlertCircle className="size-4 mb-0.5" />
                  <span className="text-[10px] leading-tight line-clamp-2">{item.error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="absolute top-1.5 left-1.5 p-1 rounded-full bg-black/60 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
