import type { Metadata } from "next";
import Link from "next/link";
import { getScholarshipCampaigns } from "@/actions/scholarship-actions";
import { PledgeForm } from "@/app/employer/scholarships/pledge/pledge-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRoleOrRedirect } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Đồng hành học bổng",
};

interface PledgePageProps {
  searchParams: Promise<{ campaignId?: string | string[] }>;
}

const PledgePage = async ({ searchParams }: PledgePageProps) => {
  const current = await requireRoleOrRedirect([
    "student",
    "alumni",
    "employer",
    "faculty_staff",
    "admin",
  ]);
  const [campaigns, query] = await Promise.all([
    getScholarshipCampaigns(),
    searchParams,
  ]);
  const requestedId = Array.isArray(query.campaignId)
    ? query.campaignId[0]
    : query.campaignId;
  const initialCampaignId = campaigns.find(
    (campaign) => campaign.id === requestedId,
  )?.id;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-start gap-3">
        <Link
          href="/scholarships"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Quay lại Quỹ khuyến học
        </Link>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
          Đồng hành cùng Quỹ khuyến học
        </h1>
        <p className="text-sm text-muted-foreground">
          Sinh viên, cựu sinh viên và các đối tác cùng hỗ trợ sinh viên toàn
          trường.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Cam kết tài trợ</CardTitle>
          <CardDescription>
            Cam kết được ghi nhận trên hệ thống, chưa phải khoản tiền đã tiếp
            nhận. Tiền được chuyển ngoài hệ thống theo hướng dẫn của chiến dịch.
            Ban quản trị chỉ xác nhận đã nhận tiền sau khi đối soát.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requestedId && !initialCampaignId && (
            <Alert>
              <AlertDescription>
                Chiến dịch được chọn không còn mở nhận tài trợ. Vui lòng chọn
                một chiến dịch đang mở bên dưới.
              </AlertDescription>
            </Alert>
          )}
          {campaigns.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Hiện chưa có chiến dịch học bổng nào đang mở nhận tài trợ.
            </p>
          ) : (
            <PledgeForm
              key={initialCampaignId ?? "all"}
              campaigns={campaigns}
              defaultName={current.profile?.fullName || current.user.name}
              initialCampaignId={initialCampaignId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PledgePage;
