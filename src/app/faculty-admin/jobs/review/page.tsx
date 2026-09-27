import Link from "next/link";
import { getJobsForFacultyReview } from "@/actions/job-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Clock, CheckCircle2 } from "lucide-react";
import { JobReviewActions } from "./job-review-actions";

const JobsReviewPage = async () => {
  const jobs = await getJobsForFacultyReview();

  const pendingList = jobs.filter((j) => j.status === "pending");
  const approvedList = jobs.filter((j) => j.status === "approved");
  const rejectedList = jobs.filter((j) => j.status === "rejected");
  const expiredList = jobs.filter((j) => j.status === "expired");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Kiểm duyệt Tin tuyển dụng
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Duyệt tin tuyển dụng từ các đối tác doanh nghiệp trước khi phát hành
          tới cộng đồng sinh viên
        </p>
      </div>

      {/* 1. Pending Review Queue */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          Tin đang chờ phê duyệt ({pendingList.length})
        </h2>

        {pendingList.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center bg-card border rounded-lg">
            Không có tin tuyển dụng nào đang chờ kiểm duyệt.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingList.map((job) => (
              <Card
                key={job.id}
                className="border-amber-500/30 bg-card shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold">
                          {job.title}
                        </CardTitle>
                        <Badge className="bg-amber-600 text-white text-[10px]">
                          Chờ duyệt
                        </Badge>
                      </div>
                      <CardDescription className="text-xs flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {job.company?.name}
                        </span>
                        <span>·</span>
                        <span className="capitalize">
                          {job.jobType.replace("_", " ")}
                        </span>
                        <span>·</span>
                        <span>{job.location}</span>
                        {job.salaryRange && (
                          <>
                            <span>·</span>
                            <span className="font-medium text-emerald-600">
                              {job.salaryRange}
                            </span>
                          </>
                        )}
                      </CardDescription>
                    </div>

                    <JobReviewActions jobId={job.id} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <div>
                    <strong className="text-foreground">Mô tả: </strong>
                    <p className="line-clamp-2 mt-0.5">{job.description}</p>
                  </div>
                  <div>
                    <strong className="text-foreground">Yêu cầu: </strong>
                    <p className="line-clamp-2 mt-0.5">{job.requirements}</p>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between text-[11px]">
                    <span>
                      Hạn nộp hồ sơ:{" "}
                      {new Date(job.expiresAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span>Phương thức: {job.applyUrlOrEmail}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 2. Recently Approved Jobs */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Tin đang mở hiển thị ({approvedList.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {approvedList.map((job) => (
            <Card
              key={job.id}
              className="p-4 flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground line-clamp-1">
                    {job.title}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-emerald-600 border-emerald-500/30"
                  >
                    Approved
                  </Badge>
                </div>
                <div className="text-muted-foreground text-[11px]">
                  {job.company?.name}
                </div>
                <div className="text-[11px] text-muted-foreground pt-1 flex justify-between">
                  <span>
                    Hạn: {new Date(job.expiresAt).toLocaleDateString("vi-VN")}
                  </span>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-primary hover:underline"
                  >
                    Xem trang tin →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobsReviewPage;
