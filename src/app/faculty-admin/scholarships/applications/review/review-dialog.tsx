"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reviewScholarshipApplication } from "@/actions/scholarship-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { Award, Check, Loader2, X } from "lucide-react";

interface ReviewDialogProps {
  applicationId: string;
  studentName: string;
  currentStatus: string;
  currentScore?: string | null;
  currentNote?: string | null;
}

export const ReviewDialog = ({
  applicationId,
  studentName,
  currentStatus,
  currentScore,
  currentNote,
}: ReviewDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(currentScore || "85");
  const [reviewNote, setReviewNote] = useState(currentNote || "");
  const [submitting, setSubmitting] = useState(false);

  const handleReview = async (decision: "approved" | "rejected") => {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toast.add({
        type: "error",
        description: "Điểm số phải từ 0 đến 100",
      });
      return;
    }

    setSubmitting(true);
    try {
      await reviewScholarshipApplication(applicationId, {
        status: decision,
        score: numScore,
        reviewNote: reviewNote.trim() || undefined,
      });

      toast.add({
        type: "success",
        description:
          decision === "approved"
            ? "Đã duyệt cấp học bổng thành công!"
            : "Đã từ chối hồ sơ",
      });

      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err.message || "Lỗi khi xét duyệt hồ sơ",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant={currentStatus === "pending" ? "default" : "outline"}
            className="h-8 text-xs gap-1.5"
          >
            <Award className="h-3.5 w-3.5" />
            {currentStatus === "pending" ? "Xét duyệt" : "Xem xét lại"}
          </Button>
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">
            Xét duyệt hồ sơ học bổng
          </DialogTitle>
          <DialogDescription>
            Đánh giá ứng viên:{" "}
            <strong className="text-foreground">{studentName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="score">Điểm đánh giá hồ sơ (Thang điểm 100)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="VD: 90"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Nhận xét / Lý do xét chọn</Label>
            <Textarea
              id="note"
              rows={3}
              placeholder="Ghi chú đánh giá thành tích học tập, hoàn cảnh khó khăn hoặc phẩm chất của sinh viên..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleReview("rejected")}
              disabled={submitting}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4 mr-1.5" />
              )}
              Từ chối hồ sơ
            </Button>

            <Button
              type="button"
              onClick={() => handleReview("approved")}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1.5" />
              )}
              Phê duyệt cấp học bổng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
