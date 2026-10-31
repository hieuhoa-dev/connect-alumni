"use client";

import * as React from "react";
import {
  UploadCloud,
  X,
  Loader2,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  type UploadPurpose,
  UPLOAD_POLICIES,
  MIME_TO_EXTENSION,
} from "@/lib/upload-policy";
import Image from "next/image";

export interface FileUploaderValue {
  fileId?: string;
  url?: string;
}

export interface FileUploaderProps {
  value?: FileUploaderValue | string | null;
  onChange: (val: { fileId: string; url: string } | null) => void;
  purpose: UploadPurpose;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export const FileUploader = ({
  value,
  onChange,
  purpose,
  label,
  helperText,
  disabled = false,
  className,
}: FileUploaderProps) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const policy = UPLOAD_POLICIES[purpose] || UPLOAD_POLICIES.avatar;

  // Normalize current value to url and fileId
  const currentUrl = typeof value === "string" ? value : value?.url;
  const currentFileId = typeof value === "object" ? value?.fileId : undefined;

  const isPdf =
    currentUrl?.toLowerCase().endsWith(".pdf") ||
    purpose === "proof_document" ||
    purpose === "cv";

  const acceptString = policy.allowedMimeTypes.join(",");

  const handleFile = async (file: File) => {
    setError(null);

    // 1. Client-side size check
    if (file.size > policy.maxSizeBytes) {
      const maxMb = Math.round(policy.maxSizeBytes / (1024 * 1024));
      setError(`Kích thước tệp vượt quá giới hạn cho phép (${maxMb}MB).`);
      return;
    }

    // 2. MIME check
    if (!policy.allowedMimeTypes.includes(file.type)) {
      setError(
        `Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp: ${policy.allowedMimeTypes.join(", ")}`,
      );
      return;
    }

    setIsUploading(true);
    setProgress(15);

    try {
      // Step A: Presign
      const presignRes = await fetch("/api/v1/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: file.type,
          size: file.size,
          purpose,
        }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({}));
        throw new Error(data.error || "Không thể khởi tạo liên kết tải tệp.");
      }

      const { uploadUrl, fileId, key, fileUrl } = await presignRes.json();
      setProgress(50);

      // Step B: Direct upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Không thể tải tệp lên máy chủ lưu trữ.");
      }

      setProgress(80);

      // Step C: Confirm & Sharp processing
      const confirmRes = await fetch("/api/v1/uploads/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          key,
        }),
      });

      if (!confirmRes.ok) {
        const confirmData = await confirmRes.json().catch(() => ({}));
        throw new Error(confirmData.error || "Không thể xác nhận xử lý tệp.");
      }

      const confirmData = await confirmRes.json();
      setProgress(100);

      onChange({
        fileId: confirmData.fileId || fileId,
        url: confirmData.fileUrl || fileUrl,
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Đã xảy ra lỗi trong quá trình tải tệp.");
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground block">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Uploaded Preview State */}
      {currentUrl ? (
        <div className="relative border rounded-lg p-3 bg-card border-border flex items-center justify-between gap-3 group">
          <div className="flex items-center gap-3 overflow-hidden">
            {isPdf ? (
              <div className="w-12 h-12 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
            ) : (
              <div className="relative w-14 h-14 rounded overflow-hidden bg-muted border shrink-0">
                <Image
                  src={currentUrl}
                  alt="Ảnh đã tải lên"
                  fill
                  className="object-cover"
                  unoptimized={currentUrl.startsWith("data:")}
                />
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-[300px]">
                {currentUrl.split("/").pop() || "Tệp đã tải lên"}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sẵn sàng sử dụng</span>
              </div>
            </div>
          </div>

          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : (
        /* Empty / Dropzone State */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center gap-2",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 bg-card hover:bg-accent/20",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "cursor-wait",
          )}
        >
          {isUploading ? (
            <div className="w-full max-w-xs space-y-3 py-2 flex flex-col items-center">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
              <p className="text-xs font-medium text-foreground">
                Đang xử lý và tải tệp lên...
              </p>
              {progress !== null && (
                <Progress value={progress} className="h-1.5 w-full" />
              )}
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Nhấn để chọn tệp hoặc kéo thả vào đây
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {policy.description}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Helper text or Error */}
      {error ? (
        <div className="flex items-center gap-1.5 text-xs text-destructive mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
