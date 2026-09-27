import Link from "next/link";
import { getMyCompanies } from "@/actions/company-actions";
import { getEmployerJobs } from "@/actions/job-actions";
import {  buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PlusCircle,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
} from "lucide-react";

const EmployerJobsPage = async () => {
  const companies = await getMyCompanies();
  const activeCompany =
    companies.find((c) => c.isActiveContext) || companies[0];

  const jobs = activeCompany ? await getEmployerJobs(activeCompany.id) : [];

  const getStatusBadge = (status: string, reason?: string | null) => {
    switch (status) {
      case "approved":
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
            <Clock className="h-3 w-3" /> Chờ Khoa duyệt
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

        <Link
          href="/employer/jobs/new"
          className={buttonVariants({ size: "sm" })}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Đăng tin mới
        </Link>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-xs text-muted-foreground space-y-3">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground opacity-40" />
              <p className="font-semibold text-foreground text-sm">
                Chưa có tin tuyển dụng nào
              </p>
              <p>
                Hãy bắt đầu tạo tin tuyển dụng đầu tiên để kết nối với các bạn
                sinh viên tài năng của Khoa.
              </p>

              <Link
                className={buttonVariants({ size: "sm" })}
                href="/employer/jobs/new"
              >
                Đăng tin tuyển dụng ngay
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
                    <div>{getStatusBadge(job.status, job.rejectedReason)}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p className="line-clamp-2">{job.description}</p>

                  {job.status === "rejected" && job.rejectedReason && (
                    <div className="p-2.5 rounded bg-destructive/10 text-destructive text-xs border border-destructive/20">
                      <strong>Lý do từ chối từ Khoa: </strong>
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
