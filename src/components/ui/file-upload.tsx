"use client";

import * as React from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon, FileText, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FileUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  purpose: "avatar" | "company_logo" | "event_cover" | "proof_document";
  label?: string;
  helperText?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export const FileUpload = ({
  value,
  onChange,
  purpose,
  label,
  helperText,
  accept,
  disabled = false,
  className,
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [mode, setMode] = React.useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = React.useState(value || "");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Default accept attributes based on purpose
  const defaultAccept =
    accept ||
    (purpose === "proof_document"
      ? "image/png,image/jpeg,image/webp,application/pdf"
      : "image/png,image/jpeg,image/webp");

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setProgress(10);

    try {
      // 1. Attempt high-speed direct upload to Object Storage via presigned URL
      let succeeded = false;
      try {
        const presignRes = await fetch("/api/v1/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size,
            purpose,
          }),
        });

        if (presignRes.ok) {
          const { uploadUrl, fileUrl } = await presignRes.json();
          setProgress(40);

          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type || "application/octet-stream",
            },
          });

          if (uploadRes.ok) {
            setProgress(100);
            onChange(fileUrl);
            setUrlInput(fileUrl);
            succeeded = true;
          }
        }
      } catch (presignErr) {
        console.warn("Direct S3 PUT failed, attempting server-side fallback:", presignErr);
      }

      // 2. Seamless server-side fallback if direct S3 PUT was blocked by browser or network
      if (!succeeded) {
        setProgress(50);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("purpose", purpose);

        const directRes = await fetch("/api/v1/uploads/direct", {
          method: "POST",
          body: formData,
        });

        if (!directRes.ok) {
          const errData = await directRes.json();
          throw new Error(errData.error || "Tải tệp lên máy chủ lưu trữ thất bại.");
        }

        const directData = await directRes.json();
        setProgress(100);
        onChange(directData.fileUrl);
        setUrlInput(directData.fileUrl);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.message || "Đã xảy ra lỗi khi tải tệp lên.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(null), 1000);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    setError(null);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const isImage =
    value &&
    (value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ||
      value.includes("images.unsplash.com") ||
      purpose !== "proof_document");

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {label && <Label className="text-xs font-medium text-foreground">{label}</Label>}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={cn(
              "hover:text-primary transition-colors cursor-pointer",
              mode === "file" && "font-bold text-primary"
            )}
          >
            Tải từ máy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={cn(
              "hover:text-primary transition-colors cursor-pointer",
              mode === "url" && "font-bold text-primary"
            )}
          >
            Dán URL
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            disabled={disabled || isUploading}
            className="text-xs font-mono"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUrlSubmit}
            disabled={disabled || !urlInput.trim()}
            className="text-xs shrink-0"
          >
            Áp dụng
          </Button>
        </div>
      ) : value ? (
        <div className="relative rounded-xl border border-border/70 p-3 bg-muted/30 flex items-center gap-3">
          {isImage ? (
            <div className="size-16 rounded-lg overflow-hidden border border-border/80 bg-background shrink-0 flex items-center justify-center">
              <img
                src={value}
                alt="Uploaded preview"
                className="size-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="size-6" />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Đã tải lên thành công</span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground truncate">{value}</p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleClear}
            disabled={disabled}
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={cn(
            "rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border/80 hover:border-primary/50 hover:bg-muted/40",
            (disabled || isUploading) && "opacity-60 cursor-not-allowed"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={defaultAccept}
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              {isUploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <UploadCloud className="size-5" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">
                {isUploading ? (
                  "Đang tải tệp lên máy chủ..."
                ) : (
                  <>
                    <span className="text-primary font-bold hover:underline">Bấm để chọn tệp</span> hoặc kéo thả vào đây
                  </>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {helperText ||
                  (purpose === "proof_document"
                    ? "Hỗ trợ định dạng PDF, JPG, PNG, WEBP (Tối đa 10MB)"
                    : "Hỗ trợ ảnh JPG, PNG, WEBP (Tối đa 5MB)")}
              </p>
            </div>

            {progress !== null && (
              <div className="w-full max-w-xs bg-muted rounded-full h-1.5 overflow-hidden mt-2">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  );
};
