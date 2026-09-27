import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignById } from "@/actions/scholarship-actions";
import { getCurrentUser } from "@/lib/permissions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  HeartHandshake,
  GraduationCap,
  Calendar,
  Users,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Lock,
} from "lucide-react";

interface ScholarshipDetailPageProps {
  params: Promise<{ id: string }>;
}

const ScholarshipDetailPage = async ({ params }: ScholarshipDetailPageProps) => {
  const { id } = await params;
  const [campaign, currentUser] = await Promise.all([
    getCampaignById(id),
    getCurrentUser(),
  ]);

  if (!campaign) {
    notFound();
  }

  const target = Number(campaign.targetAmount);
  const current = Number(campaign.currentAmount);
  const percent = Math.min(100, Math.round((current / (target || 1)) * 100));
  const isExpired = new Date(campaign.applicationDeadline) < new Date();

  const fulfilledPledges = campaign.pledges.filter((p) => p.status === "fulfilled");

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          href="/scholarships"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground text-xs">
                Quỹ Khuyến học Khoa CNTT
              </Badge>
              {isExpired ? (
                <Badge variant="destructive" className="text-xs">Đã hết hạn nộp hồ sơ</Badge>
              ) : (
                <Badge className="bg-emerald-600 text-white text-xs">Đang nhận hồ sơ</Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {campaign.title}
            </h1>
          </div>

          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Mục tiêu & Ý nghĩa chương trình</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
              {campaign.description}
            </CardContent>
          </Card>

          {/* Donor honor roll */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                Vinh danh các Nhà hảo tâm & Doanh nghiệp đồng hành
              </h3>
              <span className="text-xs text-muted-foreground">
                {fulfilledPledges.length} đơn vị đã hoàn tất tài trợ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fulfilledPledges.length === 0 ? (
                <p className="text-xs text-muted-foreground col-span-2 py-4 text-center bg-card border rounded-lg">
                  Chưa có nhà tài trợ nào được xác nhận.
                </p>
              ) : (
                fulfilledPledges.map((p) => (
                  <Card key={p.id} className="p-3 shadow-sm border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-foreground truncate pr-2">
                        {p.isAnonymous ? "Nhà hảo tâm ẩn danh" : p.donorDisplayName}
                      </div>
                      <span className="font-bold text-xs text-emerald-600 shrink-0">
                        {Number(p.amount).toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    {p.note && (
                      <p className="text-[11px] text-muted-foreground italic mt-1 line-clamp-1">
                        "{p.note}"
                      </p>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Funding Progress & Apply */}
        <div className="space-y-6">
          <Card className="border-primary/30 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Tiến độ Quỹ học bổng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đã tiếp nhận:</span>
                  <span className="font-bold text-emerald-600 text-sm">{percent}%</span>
                </div>
                <Progress value={percent} className="h-2.5" />
                <div className="space-y-1 pt-1 text-[11px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Đã nhận thực tế:</span>
                    <strong className="text-foreground">{current.toLocaleString("vi-VN")} đ</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Mục tiêu chiến dịch:</span>
                    <strong className="text-foreground">{target.toLocaleString("vi-VN")} đ</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-border">
                <span className="text-muted-foreground">Hạn chót nộp hồ sơ sinh viên:</span>
                <p className="font-semibold text-foreground text-xs">
                  {new Date(campaign.applicationDeadline).toLocaleDateString("vi-VN", {
                    dateStyle: "full",
                  })}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                {!isExpired && (
                  <Link
                    href={`/student/scholarships/${campaign.id}/apply`}
                    className={buttonVariants({ className: "w-full font-medium" })}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Nộp hồ sơ xin xét duyệt
                  </Link>
                )}

                <Link
                  href="/employer/scholarships/pledge"
                  className={buttonVariants({ variant: "outline", className: "w-full text-xs" })}
                >
                  <HeartHandshake className="h-4 w-4 mr-2" />
                  Đăng ký cam kết tài trợ
                </Link>
              </div>

              <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2 border">
                <Lock className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span>
                  Bảo mật: Hồ sơ xin học bổng chứa thông tin hoàn cảnh và bảng điểm cá nhân chỉ được xem bởi Ban Chủ nhiệm Khoa và được ghi nhận Audit Log đầy đủ.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailPage;
