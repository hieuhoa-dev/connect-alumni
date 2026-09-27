"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useReviewCompany } from "@/hooks/use-companies";
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
import { ShieldCheck, XCircle, Loader2 } from "lucide-react";

export const CompanyReviewActions = ({ companyId }: { companyId: string }) => {
  const router = useRouter();
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  const { mutate: review, isPending } = useReviewCompany();

  const handleVerify = () => {
    review(
      {
        companyId,
        status: "verified",
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  };

  const handleReject = () => {
    review(
      {
        companyId,
        status: "rejected",
        rejectedReason:
          rejectReason || "Hồ sơ chưa đạt tiêu chuẩn liên kết của Khoa",
      },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          router.refresh();
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={handleVerify}
        disabled={isPending}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
        )}
        Xác minh
      </Button>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className="text-destructive text-xs h-8"
            />
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do từ chối hồ sơ doanh nghiệp</DialogTitle>
            <DialogDescription className="text-xs">
              Vui lòng cung cấp lý do cụ thể để gửi thông báo hướng dẫn doanh
              nghiệp hoàn thiện hồ sơ.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Input
              placeholder="Ví dụ: Thiếu giấy phép kinh doanh, thông tin liên hệ không chính xác..."
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
              disabled={isPending}
            >
              {isPending && (
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
