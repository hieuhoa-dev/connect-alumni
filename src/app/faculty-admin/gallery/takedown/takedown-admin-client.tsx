"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  User,
  Phone,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { handlePhotoTakedownRequest } from "@/actions/gallery-actions";
import { toast } from "@/components/ui/toast";

interface TakedownRow {
  id: string;
  photoId: string;
  requesterName: string;
  requesterContact: string;
  reason: string;
  status: "open" | "accepted" | "rejected";
  handlerNote: string | null;
  handledAt: Date | null;
  createdAt: Date;
  photoThumbUrl: string;
  albumId: string;
  albumTitle: string;
  photoStatus: "published" | "removed";
}

interface TakedownAdminClientProps {
  initialRequests: TakedownRow[];
}

export const TakedownAdminClient = ({
  initialRequests,
}: TakedownAdminClientProps) => {
  const router = useRouter();
  const [requests, setRequests] = React.useState<TakedownRow[]>(initialRequests);
  const [activeTab, setActiveTab] = React.useState<"open" | "handled">("open");

  // Action dialog state
  const [actionItem, setActionItem] = React.useState<{
    req: TakedownRow;
    type: "accept" | "reject";
  } | null>(null);
  const [handlerNote, setHandlerNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  const openRequests = requests.filter((r) => r.status === "open");
  const handledRequests = requests.filter((r) => r.status !== "open");
  const displayList = activeTab === "open" ? openRequests : handledRequests;

  const handleConfirmAction = async () => {
    if (!actionItem) return;

    setIsSubmitting(true);
    try {
      const res = await handlePhotoTakedownRequest(actionItem.req.id, {
        action: actionItem.type,
        handlerNote: handlerNote.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Không thể xử lý yêu cầu");
        return;
      }

      toast.success(
        actionItem.type === "accept"
          ? "Đã chấp thuận yêu cầu và gỡ ảnh khỏi thư viện công khai."
          : "Đã từ chối yêu cầu gỡ ảnh.",
      );
      setActionItem(null);
      setHandlerNote("");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi xử lý yêu cầu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <Link
            href="/faculty-admin/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại quản lý Thư viện ảnh
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="size-6 text-amber-500" />
            Hàng Đợi Xử Lý Yêu Cầu Gỡ Ảnh (Takedown)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tiếp nhận và xử lý yêu cầu gỡ bỏ hình ảnh cá nhân theo Chính sách Quyền riêng tư của Nhà trường (tối đa 48h)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "open" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("open")}
            className="cursor-pointer"
          >
            Đang mở ({openRequests.length})
          </Button>
          <Button
            variant={activeTab === "handled" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("handled")}
            className="cursor-pointer"
          >
            Đã xử lý ({handledRequests.length})
          </Button>
        </div>
      </div>

      {/* Requests list */}
      {displayList.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
          <CheckCircle2 className="size-12 mx-auto text-emerald-500 mb-3 opacity-60" />
          <h3 className="font-bold text-base text-foreground">
            {activeTab === "open"
              ? "Không có yêu cầu gỡ ảnh nào đang chờ xử lý"
              : "Chưa có yêu cầu gỡ ảnh nào được xử lý"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Hệ thống sẽ tự động hiển thị tại đây ngay khi có sinh viên, cựu sinh viên hoặc khách mời gửi yêu cầu gỡ ảnh.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((req) => {
            const isOpen = req.status === "open";
            const isAccepted = req.status === "accepted";

            return (
              <div
                key={req.id}
                className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Photo thumbnail */}
                  <div className="relative size-24 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                    <Image
                      src={req.photoThumbUrl}
                      alt="Ảnh bị yêu cầu gỡ"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Request details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={isOpen ? "secondary" : isAccepted ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {isOpen
                          ? "Đang chờ xử lý"
                          : isAccepted
                          ? "Đã chấp thuận & gỡ ảnh"
                          : "Đã từ chối"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Album: <strong className="text-foreground">{req.albumTitle}</strong>
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        • Gửi lúc: {new Date(req.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        <User className="size-3.5 text-primary" />
                        {req.requesterName}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3.5 text-primary" />
                        {req.requesterContact}
                      </span>
                    </div>

                    <div className="text-xs text-foreground bg-muted/40 p-2.5 rounded-lg border border-border/60">
                      <strong>Lý do:</strong> {req.reason}
                    </div>

                    {req.handlerNote && (
                      <div className="text-xs text-muted-foreground italic">
                        <strong>Ghi chú xử lý:</strong> {req.handlerNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isOpen && (
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setActionItem({ req, type: "accept" })}
                      className="cursor-pointer"
                    >
                      <CheckCircle2 className="size-3.5 mr-1" />
                      Chấp Thuận & Gỡ Ảnh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActionItem({ req, type: "reject" })}
                      className="cursor-pointer"
                    >
                      <XCircle className="size-3.5 mr-1" />
                      Từ Chối
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal xử lý */}
      <Dialog open={!!actionItem} onOpenChange={(open) => !open && setActionItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionItem?.type === "accept" ? (
                <>
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  Xác Nhận Chấp Thuận & Gỡ Ảnh
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-destructive" />
                  Xác Nhận Từ Chối Yêu Cầu
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionItem?.type === "accept"
                ? "Ảnh này sẽ được chuyển trạng thái sang đã gỡ (ẩn khỏi mọi giao diện công khai). Ghi chú xử lý sẽ được lưu lại."
                : "Vui lòng nhập lý do từ chối để lưu vào nhật ký hệ thống."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Ghi chú xử lý (Tùy chọn)
            </label>
            <Input
              placeholder="Ví dụ: Đã xác thực theo yêu cầu cá nhân / Không hợp lệ..."
              value={handlerNote}
              onChange={(e) => setHandlerNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionItem(null)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              variant={actionItem?.type === "accept" ? "destructive" : "default"}
              onClick={handleConfirmAction}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting
                ? "Đang xử lý..."
                : actionItem?.type === "accept"
                ? "Chấp Thuận Gỡ Ảnh"
                : "Từ Chối Yêu Cầu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
