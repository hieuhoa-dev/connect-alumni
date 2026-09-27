import * as React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/permissions";
import { getMyEventsAndInvites } from "@/actions/event-actions";
import { getMyScholarshipApplications } from "@/actions/scholarship-actions";
import { getAvailableFormsForUser } from "@/actions/form-actions";
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
  GraduationCap,
  Briefcase,
  Calendar,
  ClipboardList,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const StudentDashboardPage = async () => {
  const current = await getCurrentUser();
  const [eventsData, scholarshipApps, availableSurveys] = await Promise.all([
    getMyEventsAndInvites(),
    getMyScholarshipApplications(),
    getAvailableFormsForUser(),
  ]);

  const profile = current?.profile;
  const isAlumni = current?.role === "alumni";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-card via-card to-primary/5 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Xin chào, {profile?.fullName || current?.user.name} 👋
              </h1>
              <Badge
                variant={isAlumni ? "default" : "secondary"}
                className="text-xs"
              >
                {isAlumni ? "Cựu sinh viên" : "Sinh viên"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {profile?.studentCode && `MSSV: ${profile.studentCode} · `}
              {profile?.faculty || "Khoa Công nghệ Thông tin"}
              {profile?.batchYear && ` · Khóa ${profile.batchYear}`}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/jobs"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Briefcase className="h-4 w-4 mr-1.5" />
              Tìm việc làm
            </Link>
            {isAlumni && (
              <Link
                href="/student/experiences/new"
                className={buttonVariants({ size: "sm" })}
              >
                <BookOpen className="h-4 w-4 mr-1.5" />
                Đăng bài chia sẻ
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              Sự kiện đã đăng ký
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {eventsData.registrations.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Talkshow & Workshop</span>
            <Link
              href="/student/events/my-registrations"
              className="text-primary font-medium hover:underline"
            >
              Xem lịch →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              Hồ sơ học bổng đã nộp
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {scholarshipApps.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Tiến độ xét duyệt</span>
            <Link
              href="/student/scholarships"
              className="text-primary font-medium hover:underline"
            >
              Theo dõi →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              Biểu mẫu khảo sát mở
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-600">
              {availableSurveys.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Dành riêng cho bạn</span>
            <Link
              href="/student/surveys"
              className="text-primary font-medium hover:underline"
            >
              Làm khảo sát →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Registered Events */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">
                Sự kiện tham gia sắp tới
              </CardTitle>
              <CardDescription className="text-xs">
                Danh sách talkshow bạn đã đăng ký tham dự
              </CardDescription>
            </div>
            <Link
              href="/events"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-xs",
              })}
            >
              Khám phá thêm
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventsData.registrations.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Bạn chưa đăng ký tham gia sự kiện nào.
              </p>
            ) : (
              eventsData.registrations
                .filter((reg) => reg.event != null)
                .slice(0, 3)
                .map((reg) => {
                  const event = reg.event;
                  if (!event) return null;

                  return (
                    <div
                      key={reg.id}
                      className="p-3 rounded-lg border border-border bg-card/60 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <Link
                          href={`/events/${event.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {event.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(event.startTime).toLocaleDateString(
                            "vi-VN",
                            {
                              dateStyle: "medium",
                            },
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {reg.attendanceStatus === "attended"
                          ? "Đã điểm danh"
                          : "Đã đăng ký"}
                      </Badge>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>

        {/* Available Surveys */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">
                Khảo sát & Biểu mẫu
              </CardTitle>
              <CardDescription className="text-xs">
                Đóng góp ý kiến để cải tiến chương trình đào tạo của Khoa
              </CardDescription>
            </div>
            <Link
              href="/student/surveys"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-xs",
              })}
            >
              Tất cả biểu mẫu
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableSurveys.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Không có khảo sát nào đang chờ phản hồi.
              </p>
            ) : (
              availableSurveys.slice(0, 3).map((form) => (
                <div
                  key={form.id}
                  className="p-3 rounded-lg border border-border bg-card/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1 pr-2">
                    <div className="font-semibold text-foreground line-clamp-1">
                      {form.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {form.deadline
                        ? `Hạn nộp: ${new Date(form.deadline).toLocaleDateString("vi-VN")}`
                        : "Không giới hạn thời gian"}
                    </div>
                  </div>
                  <Link
                    href={`/student/surveys/${form.id}`}
                    className={buttonVariants({
                      size: "sm",
                      className: "h-7 text-xs shrink-0",
                    })}
                  >
                    Trả lời
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

export default StudentDashboardPage;
