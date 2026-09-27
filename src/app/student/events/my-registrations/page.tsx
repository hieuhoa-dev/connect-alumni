import * as React from "react";
import Link from "next/link";
import {
  getMyEventsAndInvites,
  respondSpeakerInvitation,
} from "@/actions/event-actions";
import { getCurrentUser } from "@/lib/permissions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Check,
  X,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { SpeakerInviteResponseActions } from "./invite-actions";

const MyRegistrationsPage = async () => {
  const [data, current] = await Promise.all([
    getMyEventsAndInvites(),
    getCurrentUser(),
  ]);

  const isAlumni = current?.role === "alumni" || current?.role === "admin";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/student/events">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Khám phá sự kiện
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sự kiện của tôi
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Theo dõi lịch trình các buổi talkshow đã đăng ký và phản hồi lời mời
            diễn giả từ Khoa
          </p>
        </div>
      </div>

      {/* Speaker Invitations Section for Alumni */}
      {isAlumni && data.speakerInvites.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold text-foreground">
              Lời mời tham gia Diễn giả từ Ban Chủ nhiệm Khoa
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data.speakerInvites.map((inv) => {
              if (!inv.event) return null;
              return (
                <Card
                  key={inv.id}
                  className="border-amber-500/30 bg-amber-500/5 shadow-sm"
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-bold">
                          {inv.event.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Thời gian:{" "}
                          {new Date(inv.event.startTime).toLocaleString(
                            "vi-VN",
                            {
                              dateStyle: "full",
                              timeStyle: "short",
                            },
                          )}
                        </CardDescription>
                      </div>
                      <Badge
                        className={
                          inv.invitationStatus === "accepted"
                            ? "bg-emerald-600 text-white"
                            : inv.invitationStatus === "declined"
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-amber-600 text-white"
                        }
                      >
                        {inv.invitationStatus === "accepted"
                          ? "Đã nhận lời"
                          : inv.invitationStatus === "declined"
                            ? "Đã từ chối"
                            : "Chờ bạn phản hồi"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    {inv.note && (
                      <div className="rounded bg-background/80 p-2.5 border text-muted-foreground italic">
                        "Lời nhắn từ Khoa: {inv.note}"
                      </div>
                    )}

                    {inv.invitationStatus === "pending" && (
                      <SpeakerInviteResponseActions inviteId={inv.id} />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Registered Events List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Sự kiện bạn đã đăng ký tham dự ({data.registrations.length})
        </h2>

        {data.registrations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-xs text-muted-foreground space-y-2">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
              <p>Bạn chưa đăng ký tham dự sự kiện nào.</p>
              <Link
                href="/student/events"
                className={buttonVariants({ size: "sm" })}
              >
                Khám phá các sự kiện đang mở
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.registrations.map((reg) => {
              if (!reg.event) return null;
              return (
                <Card
                  key={reg.id}
                  className="flex flex-col justify-between shadow-sm"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-semibold"
                      >
                        {reg.event.type}
                      </Badge>
                      <Badge
                        variant={
                          reg.attendanceStatus === "attended"
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {reg.attendanceStatus === "attended"
                          ? "Đã điểm danh"
                          : "Đã đăng ký"}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold leading-snug">
                      <Link href={`/events/${reg.event.id}`}>
                        {reg.event.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground pb-3">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {new Date(reg.event.startTime).toLocaleString("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {reg.event.format === "online" ? (
                        <Video className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="truncate">
                        {reg.event.locationOrLink}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrationsPage;
