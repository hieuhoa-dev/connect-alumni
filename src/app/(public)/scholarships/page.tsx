import { Calendar, HeartHandshake, Users } from "lucide-react";
import Link from "next/link";
import { getScholarshipCampaigns } from "@/actions/scholarship-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const ScholarshipsPage = async () => {
  const [campaignsRes, currentUser] = await Promise.all([
    getScholarshipCampaigns().catch((err) => {
      console.warn(
        "[ScholarshipsPage] Database unavailable during fetch, defaulting to empty list:",
        err,
      );
      return [];
    }),
    getCurrentUser(),
  ]);
  const campaigns = campaignsRes || [];
  const displayCampaigns = campaigns;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-pine-800">
            Quỹ Khuyến học &amp; Tiếp sức Tài năng Trẻ — Đại học Đà Lạt
          </h1>
          <p className="text-sm text-muted-foreground">
            Cầu nối tài trợ từ Cựu sinh viên DLU và các Doanh nghiệp đối tác
            nhằm trao học bổng, hỗ trợ tài chính cho sinh viên vượt khó hiếu học
          </p>
        </div>
        <Button
          variant="sun"
          size="sm"
          render={<Link href="/employer/scholarships/pledge" />}
          nativeButton={false}
        >
          <HeartHandshake data-icon="inline-start" />
          Đồng hành tài trợ
        </Button>
      </div>

      {/* Campaigns list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayCampaigns.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card border border-dashed rounded-xl">
            <HeartHandshake className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-foreground">
              Hiện chưa có chiến dịch học bổng mới
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Nhà trường sẽ sớm thông báo các đợt xét học bổng tiếp theo.
            </p>
          </div>
        ) : (
          displayCampaigns.map((camp) => {
            const target = Number(camp.targetAmount);
            const current = Number(camp.currentAmount);
            const percent = Math.min(
              100,
              Math.round((current / (target || 1)) * 100),
            );

            return (
              <Card
                key={camp.id}
                className="flex flex-col justify-between hover:border-primary/50 transition shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge className="bg-primary text-primary-foreground text-[10px]">
                      Quỹ Khoa CNTT
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      Hạn nộp:{" "}
                      {new Date(camp.applicationDeadline).toLocaleDateString(
                        "vi-VN",
                      )}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold leading-snug">
                    <Link
                      href={`/scholarships/${camp.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {camp.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {camp.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pb-4">
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Tiến độ tiếp nhận quỹ:
                      </span>
                      <span className="font-bold text-pine-600 dark:text-pine-400">
                        {percent}%
                      </span>
                    </div>
                    <Progress value={percent} className="h-2" />
                    <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                      <span>
                        Đã vận động:{" "}
                        <strong className="text-foreground">
                          {current.toLocaleString("vi-VN")} đ
                        </strong>
                      </span>
                      <span>Mục tiêu: {target.toLocaleString("vi-VN")} đ</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Đóng quỹ:{" "}
                        {new Date(camp.applicationDeadline).toLocaleDateString(
                          "vi-VN",
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {camp.pledges?.length || 0} lượt cam kết tài trợ
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-5 py-3.5 flex gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    render={<Link href={`/scholarships/${camp.id}`} />}
                    nativeButton={false}
                  >
                    Xem chi tiết quỹ
                  </Button>
                  {currentUser?.role === "alumni" ? (
                    <Button
                      variant="sun"
                      size="sm"
                      className="flex-1"
                      render={
                        <Link href={`/alumni/scholarships/${camp.id}/pledge`} />
                      }
                      nativeButton={false}
                    >
                      <HeartHandshake data-icon="inline-start" />
                      Ủng hộ học bổng
                    </Button>
                  ) : currentUser?.role === "employer" ? (
                    <Button
                      variant="sun"
                      size="sm"
                      className="flex-1"
                      render={<Link href="/employer/scholarships/pledge" />}
                      nativeButton={false}
                    >
                      <HeartHandshake data-icon="inline-start" />
                      Cam kết tài trợ
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      render={
                        <Link href={`/student/scholarships/${camp.id}/apply`} />
                      }
                      nativeButton={false}
                    >
                      Nộp đơn xét học bổng
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ScholarshipsPage;
