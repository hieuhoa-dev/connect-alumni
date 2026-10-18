"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { verifyAlumni } from "@/actions/profile-actions";
import { toast } from "@/components/ui/toast";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const VerificationRowActions = ({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState<"approve" | "reject" | null>(null);
  const [showRejectBox, setShowRejectBox] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  const handleApprove = async () => {
    try {
      setLoading("approve");
      await verifyAlumni({
        targetUserId: userId,
        action: "approve",
      });
      toast.success(`Đã xác thực cựu sinh viên ${userName} thành công`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Không thể xác thực cựu sinh viên");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      toast.error("Vui lòng nhập lý do từ chối tối thiểu 5 ký tự");
      return;
    }
    try {
      setLoading("reject");
      await verifyAlumni({
        targetUserId: userId,
        action: "reject",
        reason: rejectReason.trim(),
      });
      toast.info(`Đã từ chối xác thực hồ sơ ${userName}`);
      setShowRejectBox(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Không thể xử lý yêu cầu");
    } finally {
      setLoading(null);
    }
  };

  if (showRejectBox) {
    return (
      <div className="flex flex-col gap-2 min-w-[260px] p-2 rounded-lg bg-red-50/50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50">
        <Textarea
          placeholder="Lý do từ chối (tối thiểu 5 ký tự)..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="text-xs bg-white dark:bg-neutral-900"
          rows={2}
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowRejectBox(false)}
            disabled={loading !== null}
            className="text-xs h-7 px-2"
          >
            Hủy
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleReject}
            disabled={loading !== null}
            className="text-xs h-7 px-2"
          >
            {loading === "reject" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <X className="h-3.5 w-3.5 mr-1" />
            )}
            Xác nhận từ chối
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={loading !== null}
        className="bg-[#1B7A3E] hover:bg-[#156030] text-white h-8 text-xs font-medium px-3"
      >
        {loading === "approve" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
        ) : (
          <Check className="h-3.5 w-3.5 mr-1" />
        )}
        Duyệt xác thực
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowRejectBox(true)}
        disabled={loading !== null}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8 text-xs px-2.5"
      >
        <X className="h-3.5 w-3.5 mr-1" />
        Từ chối
      </Button>
    </div>
  );
};
