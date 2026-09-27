import * as React from "react";
import Link from "next/link";
import { getScholarshipCampaigns } from "@/actions/scholarship-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  HeartHandshake,
  GraduationCap,
  Calendar,
  Users,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const ScholarshipsPage = async () => {
  const campaigns = await getScholarshipCampaigns();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Quỹ Khuyến học & Tiếp sức Tài năng Trẻ
          </h1>
          <p className="text-sm text-muted-foreground">
            Cầu nối tài trợ từ các Doanh nghiệp đối tác và Cựu sinh viên nhằm
            trao học bổng, hỗ trợ tài chính cho sinh viên vượt khó
          </p>
        </div>
        <Link
          href="/employer/scholarships/pledge"
          className={buttonVariants({ size: "sm" })}
        >
          <HeartHandshake className="h-4 w-4 mr-2" />
          Đồng hành tài trợ
        </Link>
      </div>

      {/* Campaigns list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card border border-dashed rounded-xl">
            <HeartHandshake className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-foreground">
              Hiện chưa có chiến dịch học bổng mới
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Khoa sẽ sớm thông báo các đợt xét học bổng tiếp theo.
            </p>
          </div>
        ) : (
          campaigns.map((camp) => {
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
                    <Link href={`/scholarships/${camp.id}`}>{camp.title}</Link>
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
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {percent}%
                      </span>
                    </div>
                    <Progress value={percent} className="h-2" />
                    <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                      <span>
                        Đã nhận:{" "}
                        <strong className="text-foreground">
                          {current.toLocaleString("vi-VN")} đ
                        </strong>
                      </span>
                      <span>
                        Mục tiêu:{" "}
                        <strong className="text-foreground">
                          {target.toLocaleString("vi-VN")} đ
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {camp.pledges.length} lượt tài trợ
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {camp.applications.length} hồ sơ đã nộp
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                  <Link
                    href="/employer/scholarships/pledge"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Tài trợ
                  </Link>
                  <Link
                    href={`/scholarships/${camp.id}`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    Nộp hồ sơ học bổng
                  </Link>
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
