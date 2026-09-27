import * as React from "react";
import Link from "next/link";
import { getMyCompanies } from "@/actions/company-actions";
import { getEmployerJobs } from "@/actions/job-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Briefcase,
  PlusCircle,
  ShieldCheck,
  Clock,
  XCircle,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

const EmployerDashboardPage = async () => {
  const companies = await getMyCompanies();
  const activeCompany =
    companies.find((c) => c.isActiveContext) || companies[0];

  const jobs = activeCompany ? await getEmployerJobs(activeCompany.id) : [];

  const pendingJobs = jobs.filter((j) => j.status === "pending").length;
  const approvedJobs = jobs.filter((j) => j.status === "approved").length;
  const expiredJobs = jobs.filter((j) => j.status === "expired").length;

  const isNotVerified = activeCompany.verificationStatus !== "verified";
  return (
    <div className="space-y-8">
      {/* Top Banner */}
      {!activeCompany ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <Building2 className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
          <h2 className="text-lg font-bold text-foreground">
            Bạn chưa có hồ sơ doanh nghiệp
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Vui lòng đăng ký thông tin doanh nghiệp để Khoa CNTT xác minh trước
            khi có thể đăng tin tuyển dụng.
          </p>
          <Link
            href="/employer/onboarding"
            className={buttonVariants({ size: "sm" })}
          >
            Đăng ký hồ sơ doanh nghiệp ngay
          </Link>
        </Card>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {activeCompany.name}
                </h1>
                {activeCompany.verificationStatus === "verified" && (
                  <Badge className="bg-emerald-600 text-white gap-1 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Đã xác minh bởi Khoa
                  </Badge>
                )}
                {activeCompany.verificationStatus === "pending" && (
                  <Badge className="bg-amber-600 text-white gap-1 text-xs">
                    <Clock className="h-3.5 w-3.5" />
                    Chờ Khoa xác minh
                  </Badge>
                )}
                {activeCompany.verificationStatus === "rejected" && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <XCircle className="h-3.5 w-3.5" />
                    Hồ sơ bị từ chối
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Lĩnh vực: <strong>{activeCompany.industry}</strong> · Vai trò
                của bạn: <strong>{activeCompany.membershipRole}</strong>
              </p>
            </div>

            <div className="flex gap-2">
              {isNotVerified ? (
                <Button size="sm" disabled>
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Đăng tin tuyển dụng
                </Button>
              ) : (
                <Link
                  href="/employer/jobs/new"
                  className={buttonVariants({ size: "sm" })}
                >
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Đăng tin tuyển dụng
                </Link>
              )}

              {/* Nút 2: Luôn là Link với variant outline */}
              <Link
                href="/employer/scholarships/pledge"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <HeartHandshake className="h-4 w-4 mr-1.5" />
                Tài trợ học bổng
              </Link>
            </div>
          </div>

          {activeCompany.verificationStatus === "pending" && (
            <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300 py-3 text-xs">
              <AlertDescription>
                Hồ sơ doanh nghiệp của bạn đang được Ban Chủ nhiệm Khoa CNTT xem
                xét. Tính năng đăng tin tuyển dụng sẽ tự động kích hoạt ngay khi
                hồ sơ được phê duyệt.
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">
                  Tin tuyển dụng đang mở
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-emerald-600">
                  {approvedJobs}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
                <span>Hiển thị công khai</span>
                <Link
                  href="/employer/jobs"
                  className="text-primary font-medium hover:underline"
                >
                  Quản lý tin →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">
                  Tin đang chờ Khoa duyệt
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-amber-600">
                  {pendingJobs}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
                <span>Chờ phê duyệt</span>
                <Link
                  href="/employer/jobs"
                  className="text-primary font-medium hover:underline"
                >
                  Xem chi tiết →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">
                  Tin đã hết hạn
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-muted-foreground">
                  {expiredJobs}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
                <span>Tự động ẩn</span>
                <Link
                  href="/employer/jobs"
                  className="text-primary font-medium hover:underline"
                >
                  Lịch sử →
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployerDashboardPage;
