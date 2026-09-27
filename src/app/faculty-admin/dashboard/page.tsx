import * as React from "react";
import Link from "next/link";
import { getFacultyDashboardAnalytics } from "@/actions/analytics-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Building2,
  Briefcase,
  GraduationCap,
  Calendar,
  Users,
  ScrollText,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { AnalyticsCharts } from "./analytics-charts";
import { cn } from "@/lib/utils";

const FacultyDashboardPage = async () => {
  const data = await getFacultyDashboardAnalytics();
  const { overview } = data;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bảng điều khiển Quản trị & Thống kê Khoa
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Báo cáo thời gian thực về việc làm, hoạt động cựu sinh viên, mạng lưới
          đối tác và Quỹ khuyến học
        </p>
      </div>

      {/* Actionable Pipeline Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/40 transition">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>Doanh nghiệp chờ duyệt</span>
              <Building2 className="h-4 w-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {overview.pendingCompanies}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
            <span>{overview.verifiedCompanies} đã xác minh</span>
            <Link
              href="/faculty-admin/companies/review"
              className="text-primary font-medium hover:underline"
            >
              Xử lý →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>Tin tuyển dụng chờ duyệt</span>
              <Briefcase className="h-4 w-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {overview.pendingJobs}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
            <span>{overview.approvedJobs} tin đang mở</span>
            <Link
              href="/faculty-admin/jobs/review"
              className="text-primary font-medium hover:underline"
            >
              Duyệt tin →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>Tỷ lệ tham gia sự kiện</span>
              <Calendar className="h-4 w-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {overview.attendanceRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
            <span>
              {overview.attendedRegistrations} / {overview.totalRegistrations}{" "}
              lượt
            </span>
            <Link
              href="/faculty-admin/events"
              className="text-primary font-medium hover:underline"
            >
              Quản lý →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>Quỹ Khuyến học thực thu</span>
              <GraduationCap className="h-4 w-4 text-indigo-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-600 truncate">
              {Math.round(overview.totalFulfilledFund / 1000000)} Tr đ
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
            <span>
              Cam kết: {Math.round(overview.totalPledgedFund / 1000000)} Tr đ
            </span>
            <Link
              href="/faculty-admin/scholarships/campaigns"
              className="text-primary font-medium hover:underline"
            >
              Chi tiết →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Phân tích chuyên sâu
        </h2>
        <AnalyticsCharts
          jobsByIndustry={data.jobsByIndustry}
          applicationsByStatus={data.applicationsByStatus}
          batchAlumniStats={data.batchAlumniStats}
          fundStats={{
            target: overview.totalTargetFund,
            fulfilled: overview.totalFulfilledFund,
            pledged: overview.totalPledgedFund,
          }}
        />
      </div>

      {/* Audit Log Stream Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-muted-foreground" />
            Nhật ký kiểm toán hệ thống gần đây (Audit Log)
          </h2>

          <Link
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            href="/faculty-admin/audit-logs"
          >
            Xem toàn bộ lịch sử
          </Link>
        </div>

        <Card className="shadow-sm">
          <div className="divide-y divide-border text-xs">
            {data.recentLogs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="p-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase"
                  >
                    {log.action}
                  </Badge>
                  <span className="font-medium text-foreground">
                    {log.actor?.profile?.fullName || log.actor?.name}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    thao tác trên {log.entityType} ({log.entityId.slice(0, 8)}
                    ...)
                  </span>
                </div>
                <span className="text-muted-foreground text-[11px] shrink-0">
                  {new Date(log.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FacultyDashboardPage;
