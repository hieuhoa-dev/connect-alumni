"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createDonationPledge } from "@/actions/scholarship-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, HeartHandshake, CheckCircle2, Sparkles } from "lucide-react";

interface AlumniPledgeFormProps {
  campaign: {
    id: string;
    title: string;
    currentAmount: string;
    targetAmount: string;
  };
  defaultName: string;
}

const QUICK_AMOUNTS = [
  { label: "1.000.000 đ", value: 1000000 },
  { label: "2.000.000 đ", value: 2000000 },
  { label: "5.000.000 đ", value: 5000000 },
  { label: "10.000.000 đ", value: 10000000 },
  { label: "20.000.000 đ", value: 20000000 },
  { label: "50.000.000 đ", value: 50000000 },
];

export const AlumniPledgeForm = ({
  campaign,
  defaultName,
}: AlumniPledgeFormProps) => {
  const router = useRouter();
  const [donorDisplayName, setDonorDisplayName] = React.useState(defaultName);
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [amount, setAmount] = React.useState("5000000");
  const [note, setNote] = React.useState(
    "Chúc các bạn sinh viên DLU luôn nỗ lực học tập tốt, vượt qua thử thách và không ngừng theo đuổi đam mê!",
  );

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Vui lòng nhập số tiền ủng hộ hợp lệ (lớn hơn 0).");
      setIsLoading(false);
      return;
    }

    try {
      await createDonationPledge({
        campaignId: campaign.id,
        donorDisplayName: donorDisplayName.trim() || defaultName,
        isAnonymous,
        amount: numericAmount,
        note: note.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/alumni/scholarships");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(
        err?.message || "Có lỗi xảy ra khi gửi cam kết tài trợ. Vui lòng thử lại.",
      );
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 py-8 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-600" />
        <AlertDescription className="text-base font-bold">
          Cam kết tài trợ của bạn đã được ghi nhận thành công!
        </AlertDescription>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Ban Chủ nhiệm Khoa và các em sinh viên trân trọng cảm ơn tấm lòng hảo tâm và nghĩa cử cao đẹp của bạn. Hệ thống đang chuyển hướng...
        </p>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive" className="py-2.5 text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tên vinh danh */}
      <div className="space-y-1.5">
        <Label htmlFor="donorName" className="text-xs font-semibold">
          Tên hiển thị vinh danh (Cá nhân cựu SV / Tập thể Khóa / Doanh nghiệp)
        </Label>
        <Input
          id="donorName"
          value={donorDisplayName}
          onChange={(e) => setDonorDisplayName(e.target.value)}
          placeholder="Ví dụ: Cựu SV Nguyễn Văn A - K38 CNTT"
          required
          disabled={isLoading}
          className="text-xs"
        />
        <p className="text-[11px] text-muted-foreground">
          Tên này sẽ được hiển thị trang trọng trên Bảng vàng vinh danh nhà tài trợ sau khi Khoa hoàn tất đối soát.
        </p>
      </div>

      {/* Ẩn danh */}
      <div className="flex items-center space-x-2 pt-0.5">
        <Checkbox
          id="anon"
          checked={isAnonymous}
          onCheckedChange={(checked) => setIsAnonymous(!!checked)}
          disabled={isLoading}
        />
        <Label
          htmlFor="anon"
          className="text-xs font-normal cursor-pointer text-muted-foreground"
        >
          Ủng hộ ẩn danh (Không hiển thị danh tính công khai trên Bảng vinh danh)
        </Label>
      </div>

      {/* Số tiền cam kết */}
      <div className="space-y-2">
        <Label htmlFor="amt" className="text-xs font-semibold">
          Số tiền cam kết ủng hộ (VNĐ)
        </Label>

        {/* Quick Amount Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_AMOUNTS.map((qa) => {
            const isSelected = Number(amount) === qa.value;
            return (
              <button
                key={qa.value}
                type="button"
                onClick={() => setAmount(qa.value.toString())}
                disabled={isLoading}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                    : "bg-card text-foreground hover:bg-muted border-border"
                }`}
              >
                {qa.label}
              </button>
            );
          })}
        </div>

        <div className="pt-1">
          <Input
            id="amt"
            type="number"
            min="100000"
            step="100000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={isLoading}
            className="text-sm font-bold text-emerald-600"
            placeholder="Hoặc tự nhập số tiền khác (VNĐ)..."
          />
        </div>
      </div>

      {/* Lời chúc / Lời nhắn nhủ */}
      <div className="space-y-1.5">
        <Label htmlFor="note" className="text-xs font-semibold flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Lời nhắn gửi / Lời chúc đến thế hệ sinh viên đàn em
        </Label>
        <Textarea
          id="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isLoading}
          className="text-xs leading-relaxed"
          placeholder="Chia sẻ vài dòng nhắn nhủ, động viên tiếp sức cho các em sinh viên..."
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => router.back()}
          className="text-xs"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium text-xs px-5 shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang gửi cam kết...
            </>
          ) : (
            <>
              <HeartHandshake className="h-4 w-4" />
              Gửi cam kết tài trợ
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
