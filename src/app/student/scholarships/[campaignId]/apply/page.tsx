import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignById } from "@/actions/scholarship-actions";
import { getCurrentUser } from "@/lib/permissions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { ScholarshipApplyForm } from "./apply-form";

interface ApplyPageProps {
  params: Promise<{ campaignId: string }>;
}

const ScholarshipApplyPage = async ({ params }: ApplyPageProps) => {
  const { campaignId } = await params;
  const [campaign, current] = await Promise.all([
    getCampaignById(campaignId),
    getCurrentUser(),
  ]);

  if (!campaign) {
    notFound();
  }

  const isExpired = new Date(campaign.applicationDeadline) < new Date();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/student/scholarships"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "gap-1.5 text-xs text-muted-foreground",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách học bổng
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Nộp hồ sơ xét duyệt học bổng
          </CardTitle>
          <CardDescription className="text-xs">
            Chiến dịch: <strong>{campaign.title}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              Cam kết bảo mật: Thông tin tài chính, hoàn cảnh gia đình và bảng
              điểm chỉ dùng cho mục đích xét duyệt nội bộ bởi Hội đồng Khoa và
              được kiểm toán bảo mật (Audit Log).
            </span>
          </div>

          <ScholarshipApplyForm
            campaignId={campaign.id}
            isExpired={isExpired}
            studentName={current?.profile?.fullName || current?.user.name || ""}
            studentCode={current?.profile?.studentCode || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScholarshipApplyPage;
