import {
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  getMyScholarshipApplications,
  getScholarshipCampaigns,
} from "@/actions/scholarship-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/permissions";

const StudentScholarshipsPage = async () => {
  const [myApplications, activeCampaigns, current] = await Promise.all([
    getMyScholarshipApplications(),
    getScholarshipCampaigns(),
    getCurrentUser(),
  ]);
  const canApply = current?.role === "student" || current?.role === "admin";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-600 text-white gap-1">
            <CheckCircle2 className="h-3 w-3" /> Đã phê duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Từ chối
          </Badge>
        );
      case "reviewing":
        return (
          <Badge className="bg-indigo-600 text-white gap-1">
            <Clock className="h-3 w-3" /> Đang xét duyệt
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" /> Chờ tiếp nhận
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quỹ Học bổng & Tiếp sức Sinh viên
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Theo dõi trạng thái xét duyệt hồ sơ hỗ trợ tài chính và đăng ký tham
          gia các chiến dịch học bổng đang mở
        </p>
      </div>

      {/* My Submitted Applications */}
      <div id="my-applications" className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Hồ sơ đã nộp của bạn ({myApplications.length})
        </h2>

        {myApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-xs text-muted-foreground space-y-2">
              <GraduationCap className="h-8 w-8 mx-auto text-muted-foreground opacity-40" />
              <p>Bạn chưa nộp hồ sơ xin xét duyệt học bổng nào.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myApplications.map((app) => (
              <Card key={app.id} className="shadow-sm border-border">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold">
                        {app.campaign?.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Ngày nộp:{" "}
                        {new Date(app.submittedAt).toLocaleDateString("vi-VN", {
                          dateStyle: "long",
                        })}
                      </CardDescription>
                    </div>
                    <div>{getStatusBadge(app.status)}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {app.score && (
                    <div className="flex items-center gap-2 font-medium">
                      <span className="text-muted-foreground">
                        Điểm đánh giá hội đồng:
                      </span>
                      <span className="text-primary font-bold text-sm">
                        {app.score} / 100
                      </span>
                    </div>
                  )}

                  {app.reviewNote && (
                    <div className="rounded-lg bg-muted/60 p-3 text-muted-foreground border">
                      <strong className="text-foreground">
                        Nhận xét từ hội đồng xét duyệt:{" "}
                      </strong>
                      {app.reviewNote}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Active Campaigns Open for Application */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-base font-bold text-foreground">
          Các chiến dịch học bổng đang mở tiếp nhận
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCampaigns.map((camp) => {
            const hasApplied = myApplications.some(
              (application) => application.campaignId === camp.id,
            );
            const isExpired = camp.applicationDeadline < new Date();
            return (
              <Card
                key={camp.id}
                className="flex flex-col justify-between shadow-sm"
              >
                <CardHeader className="pb-2">
                  <Badge
                    variant={isExpired ? "outline" : "secondary"}
                    className="w-fit text-[10px] mb-1"
                  >
                    {isExpired ? "Đã hết hạn nhận hồ sơ" : "Đang mở hồ sơ"}
                  </Badge>
                  <CardTitle className="text-base font-bold leading-snug">
                    <Link href={`/scholarships/${camp.id}`}>{camp.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {camp.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1 pb-3">
                  <div>
                    Hạn chót:{" "}
                    <strong className="text-foreground">
                      {new Date(camp.applicationDeadline).toLocaleDateString(
                        "vi-VN",
                      )}
                    </strong>
                  </div>
                  <div>
                    Mục tiêu quỹ:{" "}
                    <strong className="text-emerald-600">
                      {Number(camp.targetAmount).toLocaleString("vi-VN")} đ
                    </strong>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/40 flex justify-end gap-2">
                  {hasApplied ? (
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href="#my-applications" />}
                      nativeButton={false}
                    >
                      Đã nộp hồ sơ
                    </Button>
                  ) : canApply ? (
                    <Button
                      size="sm"
                      disabled={isExpired}
                      render={
                        isExpired ? undefined : (
                          <Link
                            href={`/student/scholarships/${camp.id}/apply`}
                          />
                        )
                      }
                      nativeButton={isExpired}
                    >
                      Nộp hồ sơ
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      render={<Link href={`/scholarships/${camp.id}`} />}
                      nativeButton={false}
                    >
                      Xem chiến dịch
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentScholarshipsPage;
