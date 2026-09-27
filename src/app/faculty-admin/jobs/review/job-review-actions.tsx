"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { reviewJobPost } from "@/actions/job-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const JobReviewActions = ({ jobId }: { jobId: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await reviewJobPost({
        jobId,
        status: "approved",
      });
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await reviewJobPost({
        jobId,
        status: "rejected",
        rejectedReason:
          rejectReason ||
          "Nội dung tin chưa đạt yêu cầu hoặc không đúng chuyên ngành.",
      });
      setRejectDialogOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={isLoading}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
      >
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
        Duyệt tin
      </Button>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="text-destructive text-xs h-8"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Từ chối
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do từ chối tin tuyển dụng</DialogTitle>
            <DialogDescription className="text-xs">
              Vui lòng nhập lý do cụ thể để gửi thông báo hướng dẫn doanh nghiệp
              chỉnh sửa tin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Input
              placeholder="Ví dụ: Thiếu thông tin mức lương, yêu cầu chưa rõ ràng..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="text-xs"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              )}
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
