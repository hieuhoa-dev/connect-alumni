import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/actions/event-actions";
import { getCurrentUser } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { EventRegisterButton } from "./register-button";
import { RichTextContent } from "@/components/ui/rich-text-content";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

const EventDetailPage = async ({ params }: EventDetailPageProps) => {
  const { id } = await params;
  const [event, currentUser] = await Promise.all([
    getEventById(id),
    getCurrentUser(),
  ]);

  if (!event) {
    notFound();
  }

  const isRegistered = currentUser?.user
    ? event.registrations.some((r) => r.userId === currentUser.user.id)
    : false;

  const isPassed = new Date(event.endTime) < new Date();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Button
          render={<Link href="/events" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <ArrowLeft data-icon="inline-start" />
          Quay lại danh sách sự kiện
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {event.coverImageUrl && (
            <div className="rounded-xl overflow-hidden max-h-72 w-full bg-muted border border-border/80">
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {event.type}
              </span>
              <span className="inline-flex items-center rounded-full border border-[#CDE3CB]/60 bg-[#EDF3EC] px-2.5 py-0.5 text-[10px] font-medium text-[#346538] dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                {event.format === "online" ? "Trực tuyến" : "Trực tiếp"}
              </span>
              {isPassed && (
                <span className="inline-flex items-center rounded-full border border-[#F5C2C4]/60 bg-[#FDEBEC] px-2.5 py-0.5 text-[10px] font-medium text-[#9F2F2D] dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
                  Sự kiện đã kết thúc
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground leading-snug">
              {event.title}
            </h1>
          </div>

          {/* Description */}
          <Card className="border border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Nội dung chương trình
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/90 leading-relaxed">
              <RichTextContent content={event.description} />
            </CardContent>
          </Card>

          {/* Speakers List */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-medium tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              Diễn giả & Khách mời Cựu sinh viên
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.speakers.map((sp) => {
                const alumni = sp.alumni;
                const profile = alumni?.profile;
                const speakerName =
                  profile?.fullName || alumni?.name || "Diễn giả khách mời";
                const initials = speakerName.slice(0, 2).toUpperCase();

                return (
                  <Card
                    key={sp.id}
                    className="p-4 flex items-start gap-3 border border-border/80 shadow-sm"
                  >
                    <Avatar className="size-11 border border-border/60">
                      <AvatarImage src={profile?.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-foreground text-sm">
                        {speakerName}
                      </div>
                      <div className="text-muted-foreground text-[11px] font-mono">
                        {profile?.batchYear
                          ? `Cựu sinh viên Khóa ${profile.batchYear}`
                          : "Cựu sinh viên"}
                      </div>
                      {profile?.bio && (
                        <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                          {profile.bio}
                        </p>
                      )}
                      {sp.note && (
                        <p className="text-primary text-[11px] italic pt-1">
                          "{sp.note}"
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Registration */}
        <div className="space-y-6">
          <Card className="border border-border/80 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Thông tin tham dự
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground">Thời gian:</span>
                <p className="font-medium text-foreground text-sm">
                  {new Date(event.startTime).toLocaleDateString("vi-VN", {
                    dateStyle: "full",
                  })}
                </p>
                <p className="font-mono text-muted-foreground text-xs">
                  {new Date(event.startTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(event.endTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-border/60">
                <span className="text-muted-foreground">
                  Địa điểm / Đường dẫn:
                </span>
                <p className="font-medium text-foreground text-xs flex items-center gap-1.5 mt-0.5">
                  {event.format === "online" ? (
                    <Video className="size-3.5 text-primary shrink-0" />
                  ) : (
                    <MapPin className="size-3.5 text-primary shrink-0" />
                  )}
                  <span>{event.locationOrLink}</span>
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-border/60">
                <span className="text-muted-foreground">Số lượng đăng ký:</span>
                <p className="font-mono font-semibold text-foreground text-xs">
                  {event.registrations.length}{" "}
                  {event.capacity ? `/ ${event.capacity} người` : "người"}
                </p>
              </div>

              <div className="pt-2">
                <EventRegisterButton
                  eventId={event.id}
                  isRegistered={isRegistered}
                  isPassed={isPassed}
                  isLoggedIn={!!currentUser?.user}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
