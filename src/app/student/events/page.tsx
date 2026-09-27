import * as React from "react";
import Link from "next/link";
import {
  getPublishedEvents,
  getMyEventsAndInvites,
} from "@/actions/event-actions";
import { getCurrentUser } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookmarkCheck,
} from "lucide-react";

export const metadata = {
  title: "Sự kiện & Hội thảo | Khoa CNTT",
};

const StudentEventsPage = async () => {
  const [events, myData, current] = await Promise.all([
    getPublishedEvents(),
    getMyEventsAndInvites(),
    getCurrentUser(),
  ]);

  const isAlumni = current?.role === "alumni" || current?.role === "admin";
  const registeredEventIds = new Set(
    myData.registrations.map((r) => r.event?.id),
  );
  const pendingInvitesCount = myData.speakerInvites.filter(
    (i) => i.invitationStatus === "pending",
  ).length;

  const now = new Date();

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sự kiện & Hội thảo
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Các chương trình kết nối định kỳ giữa Cựu sinh viên, Doanh nghiệp và
            Sinh viên nhằm chia sẻ kinh nghiệm thực tế.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/student/events/my-registrations" />}
            nativeButton={false}
            className="relative flex items-center gap-2"
          >
            <BookmarkCheck className="h-4 w-4 text-primary" />
            Sự kiện của tôi
            {myData.registrations.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-primary/10 text-primary">
                {myData.registrations.length}
              </span>
            )}
            {pendingInvitesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {pendingInvitesCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Speaker Invitation Alert for Alumni */}
      {isAlumni && pendingInvitesCount > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-none">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Bạn có {pendingInvitesCount} lời mời làm diễn giả từ Khoa
                </p>
                <p className="text-xs text-muted-foreground">
                  Vui lòng phản hồi lời mời để Ban tổ chức chuẩn bị chương trình
                  tốt nhất.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              render={<Link href="/student/events/my-registrations" />}
              nativeButton={false}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              Xem và phản hồi
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Events Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            Danh sách sự kiện ({events.length})
          </h2>
        </div>

        {events.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center space-y-3">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
              <h3 className="text-sm font-semibold text-foreground">
                Hiện chưa có sự kiện nào sắp diễn ra
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Khoa sẽ sớm cập nhật lịch talkshow, workshop và ngày hội kết nối
                việc làm mới nhất.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const isRegistered = registeredEventIds.has(event.id);
              const eventDate = new Date(event.startTime);
              const isPast = new Date(event.endTime) < now;

              return (
                <Card
                  key={event.id}
                  className="flex flex-col justify-between overflow-hidden border border-border shadow-sm hover:border-primary/40 transition"
                >
                  <div>
                    {event.coverImageUrl && (
                      <div className="h-40 w-full overflow-hidden bg-muted">
                        <img
                          src={event.coverImageUrl}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-semibold"
                        >
                          {event.type}
                        </Badge>
                        {isRegistered ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Đã đăng ký
                          </Badge>
                        ) : isPast ? (
                          <Badge variant="secondary" className="text-[10px]">
                            Đã kết thúc
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-600 text-white text-[10px]">
                            Đang mở đăng ký
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold leading-snug line-clamp-2">
                        <Link
                          href={`/events/${event.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {event.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2.5 text-xs text-muted-foreground pb-4">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {eventDate.toLocaleString("vi-VN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {event.format === "online" ? (
                          <Video className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span className="truncate">{event.locationOrLink}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {event.registrations?.length || 0} người tham gia
                          {event.capacity
                            ? ` / ${event.capacity}`
                            : ""}
                        </span>
                      </div>

                      {event.speakers && event.speakers.length > 0 && (
                        <div className="pt-2 border-t border-border/60">
                          <p className="text-[11px] font-semibold text-foreground mb-1">
                            Diễn giả khách mời:
                          </p>
                          <div className="space-y-0.5">
                            {event.speakers.map((spk) => (
                              <p
                                key={spk.id}
                                className="text-[11px] truncate text-muted-foreground"
                              >
                                • {spk.alumni?.profile?.fullName || spk.alumni?.name || "Khách mời"}
                                {spk.alumni?.profile?.batchYear &&
                                  ` (Khóa ${spk.alumni.profile.batchYear})`}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  <CardFooter className="pt-0 border-t border-border/40 p-4">
                    <Button
                      variant={isRegistered ? "outline" : "default"}
                      size="sm"
                      render={<Link href={`/events/${event.id}`} />}
                      nativeButton={false}
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      {isRegistered
                        ? "Xem chi tiết sự kiện"
                        : "Xem chi tiết & Đăng ký"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEventsPage;
