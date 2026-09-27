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
import { Loader2, HeartHandshake, CheckCircle2 } from "lucide-react";

interface PledgeFormProps {
  campaigns: {
    id: string;
    title: string;
    currentAmount: string;
    targetAmount: string;
  }[];
  defaultName: string;
}

export const PledgeForm = ({ campaigns, defaultName }: PledgeFormProps) => {
  const router = useRouter();
  const [campaignId, setCampaignId] = React.useState(campaigns[0]?.id || "");
  const [donorDisplayName, setDonorDisplayName] = React.useState(defaultName);
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [amount, setAmount] = React.useState("10000000");
  const [note, setNote] = React.useState(
    "Tài trợ trao học bổng cho các sinh viên vượt khó",
  );

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createDonationPledge({
        campaignId,
        donorDisplayName,
        isAnonymous,
        amount: Number(amount),
        note: note || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/scholarships");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi tạo cam kết tài trợ.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-6 text-center space-y-2">
        <CheckCircle2 className="h-8 w-8 mx-auto" />
        <AlertDescription className="text-sm font-bold">
          Cam kết tài trợ của bạn đã được ghi nhận!
        </AlertDescription>
        <p className="text-xs text-muted-foreground">
          Ban Chủ nhiệm Khoa trân trọng cảm ơn sự đồng hành quý báu của Quý đơn
          vị/Nhà hảo tâm. Đang chuyển hướng...
        </p>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="camp" className="text-xs font-medium">
          Chiến dịch học bổng nhận tài trợ
        </Label>
        <select
          id="camp"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          required
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="donorName" className="text-xs font-medium">
          Tên hiển thị vinh danh (Cá nhân / Doanh nghiệp)
        </Label>
        <Input
          id="donorName"
          value={donorDisplayName}
          onChange={(e) => setDonorDisplayName(e.target.value)}
          required
          disabled={isLoading}
          className="text-xs"
        />
      </div>

      <div className="flex items-center space-x-2 pt-1">
        <Checkbox
          id="anon"
          checked={isAnonymous}
          onCheckedChange={(checked) => setIsAnonymous(!!checked)}
        />
        <Label
          htmlFor="anon"
          className="text-xs font-normal cursor-pointer text-muted-foreground"
        >
          Tài trợ ẩn danh (Không hiển thị tên công khai trên bảng vinh danh)
        </Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amt" className="text-xs font-medium">
          Số tiền cam kết tài trợ (VNĐ)
        </Label>
        <Input
          id="amt"
          type="number"
          min="100000"
          step="100000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={isLoading}
          className="text-xs font-semibold text-emerald-600"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pNote" className="text-xs font-medium">
          Lời nhắn / Lời chúc gửi tới sinh viên
        </Label>
        <Textarea
          id="pNote"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isLoading}
          className="text-xs"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="gap-2 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang ghi nhận...
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
