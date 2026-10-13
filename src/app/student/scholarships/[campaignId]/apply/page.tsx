import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormById } from "@/actions/form-actions";
import {
  getCampaignById,
  getMyScholarshipApplications,
} from "@/actions/scholarship-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRoleOrRedirect } from "@/lib/permissions";
import { ScholarshipApplyForm } from "./apply-form";

interface ApplyPageProps {
  params: Promise<{ campaignId: string }>;
}

const ScholarshipApplyPage = async ({ params }: ApplyPageProps) => {
  const { campaignId } = await params;
  const current = await requireRoleOrRedirect(["student"]);
  const [campaign, applications] = await Promise.all([
    getCampaignById(campaignId),
    getMyScholarshipApplications(),
  ]);

  if (!campaign) {
    notFound();
  }

  const isExpired =
    campaign.status !== "open" ||
    new Date(campaign.applicationDeadline) < new Date();
  const applicationForm = campaign.applicationFormId
    ? await getFormById(campaign.applicationFormId)
    : null;
  const existingApplication = applications.find(
    (application) => application.campaignId === campaignId,
  );

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
              điểm chỉ dùng cho mục đích xét duyệt nội bộ bởi Hội đồng xét duyệt
              và được kiểm toán bảo mật (Audit Log).
            </span>
          </div>

          {existingApplication ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                Bạn đã nộp hồ sơ cho chiến dịch này. Theo dõi kết quả xét duyệt
                trong danh sách học bổng.
              </p>
              <Button
                render={<Link href="/student/scholarships#my-applications" />}
                nativeButton={false}
              >
                Xem hồ sơ đã nộp
              </Button>
            </div>
          ) : (
            <ScholarshipApplyForm
              campaignId={campaign.id}
              isExpired={isExpired}
              studentName={
                current?.profile?.fullName || current?.user.name || ""
              }
              studentCode={current?.profile?.studentCode || ""}
              applicationForm={applicationForm}
              requiresApplicationForm={!!campaign.applicationFormId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScholarshipApplyPage;
