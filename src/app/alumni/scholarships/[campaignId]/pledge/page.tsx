import * as React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCampaignById } from "@/actions/scholarship-actions";
import { getCurrentUser } from "@/lib/permissions";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, HeartHandshake, ShieldCheck, Banknote } from "lucide-react";
import { AlumniPledgeForm } from "./pledge-form";

export const dynamic = "force-dynamic";

interface AlumniPledgePageProps {
  params: Promise<{ campaignId: string }>;
}

const AlumniPledgePage = async ({ params }: AlumniPledgePageProps) => {
  const { campaignId } = await params;
  const [campaign, current] = await Promise.all([
    getCampaignById(campaignId),
    getCurrentUser(),
  ]);

  if (!campaign) {
    notFound();
  }

  // Guard: If student accesses pledge, redirect to apply form
  if (current?.role === "student") {
    redirect(`/student/scholarships/${campaignId}/apply`);
  }

  const defaultName =
    current?.profile?.fullName || current?.user?.name || "Cựu sinh viên DLU";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/alumni/scholarships"
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

      <Card className="shadow-sm border-border">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <HeartHandshake className="h-4 w-4" />
            <span>Nghĩa tình Cựu sinh viên Đại học Đà Lạt</span>
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Cam kết tài trợ Quỹ Khuyến học
          </CardTitle>
          <CardDescription className="text-xs">
            Chiến dịch: <strong className="text-foreground">{campaign.title}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Information box on Honor Pledge & Bank transfer */}
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3.5 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Quy trình cam kết danh dự & Đối soát minh bạch</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Hệ thống ghi nhận cam kết danh dự (Pledge). Quý Cựu sinh viên sẽ chuyển khoản trực tiếp qua tài khoản ngân hàng chính thức của Nhà trường/Khoa ngoài hệ thống. Ban Chủ nhiệm Khoa sẽ đối soát sao kê và cập nhật trạng thái "Đã tiếp nhận" lên Bảng vàng vinh danh.
            </p>
          </div>

          <AlumniPledgeForm
            campaign={campaign}
            defaultName={defaultName}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AlumniPledgePage;
