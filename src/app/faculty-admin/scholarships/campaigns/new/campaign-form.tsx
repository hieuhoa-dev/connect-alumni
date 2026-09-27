"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createScholarshipCampaign } from "@/actions/scholarship-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Check } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface CampaignFormProps {
  availableForms: Array<{ id: string; title: string }>;
}

export const CampaignForm = ({ availableForms }: CampaignFormProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [applicationFormId, setApplicationFormId] = useState<string>("none");
  const [status, setStatus] = useState<"open" | "draft">("open");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.add({
        type: "error",
        description: "Vui lòng nhập tên chiến dịch",
      });
      return;
    }

    const amountNum = parseFloat(targetAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.add({
        type: "error",
        description: "Vui lòng nhập số tiền mục tiêu hợp lệ (> 0)",
      });
      return;
    }

    if (!applicationDeadline) {
      toast.add({
        type: "error",
        description: "Vui lòng chọn hạn chót nộp hồ sơ xin học bổng",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createScholarshipCampaign({
        title,
        description,
        targetAmount: amountNum,
        applicationDeadline: new Date(applicationDeadline),
        applicationFormId:
          applicationFormId !== "none" ? applicationFormId : undefined,
        status,
      });

      toast.add({
        type: "success",
        description: "Tạo chiến dịch học bổng thành công!",
      });
      router.push("/scholarships/campaigns");
      router.refresh();
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err.message || "Lỗi khi tạo chiến dịch",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-serif">
          Thông tin Chiến dịch Học bổng
        </CardTitle>
        <CardDescription>
          Thiết lập mục tiêu quỹ, thời hạn nộp và mẫu biểu hồ sơ cho sinh viên
          ứng tuyển.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Tên chiến dịch học bổng{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="VD: Quỹ Học bổng Tài năng CNTT & Cựu sinh viên Khóa 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">
              Mô tả chi tiết & Tiêu chuẩn xét chọn{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="desc"
              rows={4}
              placeholder="Quy định đối tượng sinh viên được nộp hồ sơ, mức học bổng mỗi suất, tiêu chuẩn học tập và rèn luyện..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Số tiền mục tiêu huy động (VNĐ){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="1000000"
                step="500000"
                placeholder="VD: 50000000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">
                Hạn chót nộp hồ sơ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mẫu biểu ứng tuyển đính kèm</Label>
              <Select
                value={applicationFormId}
                onValueChange={setApplicationFormId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn biểu mẫu hồ sơ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không gắn biểu mẫu riêng</SelectItem>
                  {availableForms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái chiến dịch</Label>
              <Select
                value={status}
                onValueChange={(val: any) => setStatus(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">
                    Công khai (Mở nhận tài trợ & hồ sơ)
                  </SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Khởi tạo chiến dịch
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
