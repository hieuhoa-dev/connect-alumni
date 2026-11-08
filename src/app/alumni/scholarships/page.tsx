import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/permissions";
import {
  getMyDonationPledges,
  getScholarshipCampaigns,
} from "@/actions/scholarship-actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  HeartHandshake,
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

const AlumniScholarshipsPage = async () => {
  const current = await getCurrentUser();
  if (!current?.user) {
    redirect("/login?next=/alumni/scholarships");
  }

  // Guard: If student accesses alumni scholarships, redirect to student scholarships
  if (current.role === "student") {
    redirect("/student/scholarships");
  }

  const [myPledges, activeCampaigns] = await Promise.all([
    getMyDonationPledges(),
    getScholarshipCampaigns(),
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "fulfilled":
        return (
          <Badge className="bg-emerald-600 text-white gap-1 text-[11px]">
            <CheckCircle2 className="h-3 w-3" /> Đã tiếp nhận
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <XCircle className="h-3 w-3" /> Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
            <Clock className="h-3 w-3" /> Đang chờ đối soát
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Đồng hành cùng Quỹ Khuyến học DLU
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quỹ Học bổng & Tiếp sức Sinh viên
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Sự đóng góp và cam kết tài trợ của Quý Cựu sinh viên là nguồn động viên vô giá, tiếp sức cho các bạn sinh viên vượt khó, tài năng vươn xa trên giảng đường Đại học Đà Lạt.
          </p>
        </div>

        <div className="shrink-0">
          <div className="rounded-lg bg-card border border-border p-3 text-xs text-muted-foreground flex items-center gap-2 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Hệ thống ghi nhận cam kết danh dự & minh bạch kiểm toán</span>
          </div>
        </div>
      </div>

      {/* Section 1: My Donation Pledges */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <HeartHandshake className="h-4 w-4 text-emerald-600" />
          Các khoản tài trợ đã cam kết của bạn ({myPledges.length})
        </h2>

        {myPledges.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-xs text-muted-foreground space-y-2">
              <HeartHandshake className="h-8 w-8 mx-auto text-muted-foreground opacity-30" />
              <p>Bạn chưa thực hiện khoản cam kết tài trợ nào.</p>
              <p className="text-[11px] text-muted-foreground">
                Hãy lựa chọn một chiến dịch học bổng bên dưới để chung tay cùng Nhà trường!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPledges.map((pledge) => (
              <Card key={pledge.id} className="shadow-2xs border-border">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold line-clamp-1">
                        {pledge.campaign?.title || "Quỹ Khuyến học Khoa CNTT"}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Ngày gửi cam kết:{" "}
                        {new Date(pledge.createdAt).toLocaleDateString("vi-VN", {
                          dateStyle: "medium",
                        })}
                      </CardDescription>
                    </div>
                    <div>{getStatusBadge(pledge.status)}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border">
                    <span className="text-muted-foreground">Số tiền cam kết:</span>
                    <span className="text-emerald-600 font-bold text-sm">
                      {Number(pledge.amount).toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground">
                    Tên vinh danh:{" "}
                    <strong className="text-foreground">
                      {pledge.isAnonymous
                        ? "Nhà hảo tâm ẩn danh"
                        : pledge.donorDisplayName}
                    </strong>
                  </div>

                  {pledge.note && (
                    <div className="rounded-lg bg-muted/30 p-2 text-[11px] text-muted-foreground italic border border-border/40">
                      "{pledge.note}"
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Active Scholarship Campaigns */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Các chiến dịch học bổng đang kêu gọi tài trợ
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Lựa chọn chiến dịch để gửi cam kết ủng hộ và đồng hành cùng các em sinh viên
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCampaigns.map((camp) => {
            const target = Number(camp.targetAmount) || 1;
            const currentAmt = Number(camp.currentAmount) || 0;
            const percent = Math.min(100, Math.round((currentAmt / target) * 100));

            return (
              <Card
                key={camp.id}
                className="flex flex-col justify-between shadow-2xs hover:shadow-sm transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge className="bg-emerald-600 text-white text-[10px]">
                      Đang nhận tài trợ
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      Hạn nhận: {new Date(camp.applicationDeadline).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold leading-snug">
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

                <CardContent className="space-y-3 pb-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Tiến độ quyên góp:</span>
                      <strong className="text-emerald-600">{percent}%</strong>
                    </div>
                    <Progress value={percent} className="h-2" />
                    <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>
                        Đã nhận: {currentAmt.toLocaleString("vi-VN")} đ
                      </span>
                      <span>
                        Mục tiêu: {target.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/40 flex justify-between gap-2">
                  <Link
                    href={`/scholarships/${camp.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "text-xs",
                    })}
                  >
                    Xem chi tiết quỹ
                  </Link>
                  <Link
                    href={`/alumni/scholarships/${camp.id}/pledge`}
                    className={buttonVariants({
                      size: "sm",
                      className:
                        "bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-medium",
                    })}
                  >
                    <HeartHandshake className="h-4 w-4" />
                    Ủng hộ học bổng
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AlumniScholarshipsPage;
