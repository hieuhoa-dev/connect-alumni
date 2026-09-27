"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useApplyScholarship } from "@/hooks/use-scholarships";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

interface ScholarshipApplyFormProps {
  campaignId: string;
  isExpired: boolean;
  studentName: string;
  studentCode: string;
}

export const ScholarshipApplyForm = ({
  campaignId,
  isExpired,
  studentName,
  studentCode,
}: ScholarshipApplyFormProps) => {
  const router = useRouter();
  const [gpa, setGpa] = React.useState("");
  const [circumstance, setCircumstance] = React.useState("");
  const [proofUrl, setProofUrl] = React.useState("");

  const { mutate: apply, isPending, isSuccess, error } = useApplyScholarship();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    apply(
      { campaignId },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.push("/student/scholarships");
          }, 2000);
        },
      },
    );
  };

  if (isExpired) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground">
        Chiến dịch học bổng này đã kết thúc nhận hồ sơ.
      </div>
    );
  }

  if (isSuccess) {
    return (
      <Alert className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-6 text-center space-y-2">
        <CheckCircle2 className="h-8 w-8 mx-auto" />
        <AlertDescription className="text-sm font-bold">
          Hồ sơ của bạn đã được nộp thành công!
        </AlertDescription>
        <p className="text-xs text-muted-foreground">
          Ban Chủ nhiệm Khoa sẽ xem xét hồ sơ và thông báo kết quả qua email và
          cổng thông tin. Đang chuyển hướng...
        </p>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertDescription>
            {error.message || "Có lỗi xảy ra khi nộp hồ sơ"}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Họ tên sinh viên</Label>
          <Input value={studentName} disabled className="text-xs bg-muted" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Mã số sinh viên</Label>
          <Input
            value={studentCode || "Chưa cập nhật"}
            disabled
            className="text-xs bg-muted"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="gpa" className="text-xs font-medium">
          Điểm trung bình tích lũy (GPA)
        </Label>
        <Input
          id="gpa"
          placeholder="Ví dụ: 3.65 (Thang điểm 4)"
          value={gpa}
          onChange={(e) => setGpa(e.target.value)}
          required
          disabled={isPending}
          className="text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="circumstance" className="text-xs font-medium">
          Mô tả hoàn cảnh và nguyện vọng hỗ trợ
        </Label>
        <Textarea
          id="circumstance"
          placeholder="Trình bày hoàn cảnh kinh tế gia đình, khó khăn gặp phải và mục tiêu sử dụng học bổng..."
          rows={5}
          value={circumstance}
          onChange={(e) => setCircumstance(e.target.value)}
          required
          disabled={isPending}
          className="text-xs leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proofUrl" className="text-xs font-medium">
          Link tài liệu minh chứng (Bảng điểm / Giấy xác nhận hoàn cảnh)
        </Label>
        <Input
          id="proofUrl"
          placeholder="Dán link Google Drive hoặc OneDrive chứa file PDF/ảnh scan minh chứng..."
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          required
          disabled={isPending}
          className="text-xs font-mono"
        />
        <p className="text-[11px] text-muted-foreground">
          Đảm bảo link tài liệu ở chế độ xem được cấp quyền cho Khoa CNTT.
        </p>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="gap-2 font-medium"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang gửi hồ sơ...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Xác nhận nộp hồ sơ
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
