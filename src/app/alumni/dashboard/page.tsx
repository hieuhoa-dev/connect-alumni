import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import { getMyDonationPledges, getScholarshipCampaigns } from "@/actions/scholarship-actions";
import { getMyEventsAndInvites } from "@/actions/event-actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HeartHandshake,
  GraduationCap,
  Briefcase,
  Calendar,
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

const AlumniDashboardPage = async () => {
  const current = await getCurrentUser();
  if (!current?.user) {
    redirect("/login?next=/alumni/dashboard");
  }

  // Guard: If student accesses alumni dashboard, redirect to student dashboard
  if (current.role === "student") {
    redirect("/student/dashboard");
  }

  const [myPledges, eventsData, campaigns] = await Promise.all([
    getMyDonationPledges(),
    getMyEventsAndInvites(),
    getScholarshipCampaigns(),
  ]);

  const profile = current?.profile;
  const currentTitle =
    profile && "currentTitle" in profile
      ? ((profile as Record<string, unknown>).currentTitle as string | null)
      : null;
  const currentCompanyName =
    profile && "currentCompanyName" in profile
      ? ((profile as Record<string, unknown>).currentCompanyName as string | null)
      : null;

  const totalPledged = myPledges.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0,
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-card via-card to-emerald-500/5 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Chào mừng trở lại, {profile?.fullName || current.user.name} 👋
              </h1>
              <Badge className="bg-amber-600/90 text-white text-xs">
                Cựu sinh viên DLU
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {profile?.studentCode && `MSSV: ${profile.studentCode} · `}
              {profile?.faculty || "Khoa Công nghệ Thông tin"}
              {profile?.batchYear && ` · Khóa ${profile.batchYear}`}
              {currentTitle && ` · ${currentTitle}`}
              {currentCompanyName && ` tại ${currentCompanyName}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/alumni/scholarships"
              className={buttonVariants({
                size: "sm",
                className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5",
              })}
            >
              <HeartHandshake className="h-4 w-4" />
              Ủng hộ Quỹ học bổng
            </Link>
            <Link
              href="/student/experiences/new"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <BookOpen className="h-4 w-4 mr-1.5" />
              Đăng bài chia sẻ
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pledges Stat */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <HeartHandshake className="h-3.5 w-3.5 text-emerald-600" />
              Cam kết tài trợ Quỹ Khuyến học
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {myPledges.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
            <span>
              Tổng giá trị: <strong>{totalPledged.toLocaleString("vi-VN")} đ</strong>
            </span>
            <Link
              href="/alumni/scholarships"
              className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
            >
              Chi tiết →
            </Link>
          </CardContent>
        </Card>

        {/* Events Stat */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Sự kiện kết nối & Homecoming
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {eventsData.registrations.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Giao lưu & Hội thảo</span>
            <Link
              href="/student/events/my-registrations"
              className="text-primary font-medium hover:underline"
            >
              Xem lịch →
            </Link>
          </CardContent>
        </Card>

        {/* Network Stat */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-indigo-600" />
              Mạng lưới Cựu sinh viên DLU
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-600">
              Kết nối
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Đồng môn toàn quốc</span>
            <Link
              href="/alumni"
              className="text-indigo-600 font-medium hover:underline"
            >
              Xem danh bạ →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: My Pledges & Open Campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Pledges */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                Các khoản tài trợ đã cam kết
              </CardTitle>
              <CardDescription className="text-xs">
                Ghi nhận nghĩa cử cao đẹp vì thế hệ sinh viên tương lai
              </CardDescription>
            </div>
            <Link
              href="/alumni/scholarships"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-xs",
              })}
            >
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {myPledges.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
                <HeartHandshake className="h-8 w-8 mx-auto text-muted-foreground opacity-30" />
                <p>Bạn chưa thực hiện cam kết tài trợ nào.</p>
                <Link
                  href="/alumni/scholarships"
                  className={buttonVariants({
                    size: "sm",
                    variant: "outline",
                    className: "text-xs mt-2",
                  })}
                >
                  Khám phá các chiến dịch học bổng
                </Link>
              </div>
            ) : (
              myPledges.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-lg border border-border bg-card/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1 pr-2">
                    <div className="font-semibold text-foreground line-clamp-1">
                      {p.campaign?.title || "Quỹ Khuyến học Khoa CNTT"}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{Number(p.amount).toLocaleString("vi-VN")} đ</span>
                      <span>·</span>
                      <span>
                        {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      p.status === "fulfilled"
                        ? "default"
                        : p.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-[10px] capitalize shrink-0"
                  >
                    {p.status === "fulfilled"
                      ? "Đã tiếp nhận"
                      : p.status === "cancelled"
                        ? "Đã hủy"
                        : "Chờ đối soát"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Chiến dịch học bổng đang kêu gọi
              </CardTitle>
              <CardDescription className="text-xs">
                Chung tay đóng góp trao cơ hội học tập cho sinh viên
              </CardDescription>
            </div>
            <Link
              href="/alumni/scholarships"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-xs",
              })}
            >
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaigns.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                Hiện không có chiến dịch học bổng nào đang mở.
              </p>
            ) : (
              campaigns.slice(0, 3).map((camp) => (
                <div
                  key={camp.id}
                  className="p-3 rounded-lg border border-border bg-card/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1 pr-2 max-w-[65%]">
                    <Link
                      href={`/scholarships/${camp.id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {camp.title}
                    </Link>
                    <div className="text-[11px] text-muted-foreground">
                      Mục tiêu:{" "}
                      <strong className="text-foreground">
                        {Number(camp.targetAmount).toLocaleString("vi-VN")} đ
                      </strong>
                    </div>
                  </div>
                  <Link
                    href={`/alumni/scholarships/${camp.id}/pledge`}
                    className={buttonVariants({
                      size: "sm",
                      className:
                        "bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 shrink-0",
                    })}
                  >
                    Ủng hộ
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlumniDashboardPage;
