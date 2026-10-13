import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  PlusCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { getMyCompanies } from "@/actions/company-actions";
import { getEmployerJobs } from "@/actions/job-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const EmployerJobsPage = async () => {
  const companies = await getMyCompanies();
  const activeCompany =
    companies.find((c) => c.isActiveContext) || companies[0];

  const jobs = activeCompany ? await getEmployerJobs(activeCompany.id) : [];
  const isVerified = activeCompany?.verificationStatus === "verified";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        if (!isVerified) {
          return <Badge variant="secondary">Đã duyệt · Tạm ẩn</Badge>;
        }
        return (
          <Badge className="bg-emerald-600 text-white gap-1">
            <CheckCircle2 className="h-3 w-3" /> Đang hiển thị
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Bị từ chối
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> Đã hết hạn
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-600 text-white gap-1">
            <Clock className="h-3 w-3" /> Chờ duyệt
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý tin tuyển dụng
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Doanh nghiệp đang chọn:{" "}
            <strong className="text-foreground">
              {activeCompany?.name || "Chưa chọn"}
            </strong>
          </p>
        </div>

        {!activeCompany ? (
          <Link
            href="/employer/onboarding"
            className={buttonVariants({ size: "sm" })}
          >
            Đăng ký doanh nghiệp
          </Link>
        ) : isVerified ? (
          <Link
            href="/employer/jobs/new"
            className={buttonVariants({ size: "sm" })}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Đăng tin mới
          </Link>
        ) : (
          <Button size="sm" disabled>
            Đăng tin mới
          </Button>
        )}
      </div>

      {activeCompany && !isVerified && (
        <p className="text-sm text-muted-foreground">
          Tin tuyển dụng chỉ hiển thị công khai khi hồ sơ doanh nghiệp đã được
          xác minh. Bạn có thể xem trạng thái và lý do tại{" "}
          <Link
            href="/employer/dashboard"
            className="underline underline-offset-4"
          >
            Tổng quan doanh nghiệp
          </Link>
          .
        </p>
      )}

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-xs text-muted-foreground space-y-3">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground opacity-40" />
              <p className="font-semibold text-foreground text-sm">
                Chưa có tin tuyển dụng nào
              </p>
              <p>
                {isVerified
                  ? "Tạo tin tuyển dụng đầu tiên để kết nối với sinh viên và cựu sinh viên Đại học Đà Lạt."
                  : "Hoàn tất đăng ký và xác minh hồ sơ doanh nghiệp trước khi đăng tin tuyển dụng."}
              </p>

              <Link
                className={buttonVariants({ size: "sm" })}
                href={
                  !activeCompany
                    ? "/employer/onboarding"
                    : isVerified
                      ? "/employer/jobs/new"
                      : "/employer/dashboard"
                }
              >
                {!activeCompany
                  ? "Đăng ký doanh nghiệp"
                  : isVerified
                    ? "Đăng tin tuyển dụng ngay"
                    : "Xem hồ sơ doanh nghiệp"}
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold">
                        {job.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1 flex items-center gap-3">
                        <span className="capitalize">
                          {job.jobType.replace("_", " ")}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        {job.salaryRange && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-emerald-600">
                              {job.salaryRange}
                            </span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <div>{getStatusBadge(job.status)}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p className="line-clamp-2">{job.description}</p>

                  {job.status === "rejected" && job.rejectedReason && (
                    <div className="p-2.5 rounded bg-destructive/10 text-destructive text-xs border border-destructive/20">
                      <strong>Lý do từ chối: </strong>
                      {job.rejectedReason}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border">
                    <span>
                      Hạn nộp hồ sơ:{" "}
                      {new Date(job.expiresAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span>
                      Ngày tạo:{" "}
                      {new Date(job.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerJobsPage;
