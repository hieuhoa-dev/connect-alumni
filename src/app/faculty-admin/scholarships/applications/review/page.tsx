import Link from "next/link";
import { getAllApplicationsForReview } from "@/actions/scholarship-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
} from "lucide-react";
import { ReviewDialog } from "./review-dialog";

export const metadata = {
  title: "Xét duyệt hồ sơ học bổng | Khoa CNTT",
};

const ScholarshipApplicationsReviewPage = async () => {
  const applications = await getAllApplicationsForReview();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Đã duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Từ chối
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Đang chờ duyệt
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/faculty-admin/scholarships/campaigns">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Về quản lý chiến dịch
              </Button>
            </Link>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
              Hội đồng Xét duyệt Hồ sơ Học bổng
            </h1>
          </div>
          <p className="text-xs text-muted-foreground pl-2">
            Xem hồ sơ, chấm điểm tiêu chuẩn và ban hành kết quả phê duyệt học
            bổng cho sinh viên.
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                Chưa có hồ sơ xin học bổng nào
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Các hồ sơ ứng tuyển từ sinh viên gửi lên sẽ xuất hiện tại đây để
                hội đồng xét duyệt.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const student = app.student?.profile;
            return (
              <Card
                key={app.id}
                className="border-border hover:border-primary/40 transition-colors"
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif font-bold text-base text-foreground">
                        {student?.fullName || "Sinh viên"}
                      </span>
                      {student?.studentCode && (
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          MSSV: {student.studentCode}
                        </span>
                      )}
                      {student?.batchYear && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          Khóa: K{student.batchYear}
                        </span>
                      )}
                      {getStatusBadge(app.status)}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Chiến dịch:{" "}
                      <strong className="text-foreground font-medium">
                        {app.campaign?.title}
                      </strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Nộp ngày:{" "}
                        {new Date(app.submittedAt).toLocaleDateString("vi-VN")}
                      </span>
                      {app.score && (
                        <span className="text-primary font-bold">
                          Điểm chấm: {app.score} / 100
                        </span>
                      )}
                      {app.decidedAt && (
                        <span>
                          Duyệt ngày:{" "}
                          {new Date(app.decidedAt).toLocaleDateString("vi-VN")}{" "}
                          bởi {app.reviewer?.profile?.fullName || "Hội đồng"}
                        </span>
                      )}
                    </div>

                    {app.reviewNote && (
                      <div className="text-xs bg-muted/40 p-2 rounded text-muted-foreground border border-border">
                        <strong>Ghi chú nhận xét:</strong> {app.reviewNote}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <ReviewDialog
                      applicationId={app.id}
                      studentName={student?.fullName || "Sinh viên"}
                      currentStatus={app.status}
                      currentScore={app.score}
                      currentNote={app.reviewNote}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScholarshipApplicationsReviewPage;
