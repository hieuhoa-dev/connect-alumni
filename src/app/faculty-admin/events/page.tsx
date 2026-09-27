import Link from "next/link";
import { getPublishedEvents } from "@/actions/event-actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Calendar,
  PlusCircle,
  Users,
  Clock,
  Video,
  MapPin,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FacultyEventsPage = async () => {
  const events = await getPublishedEvents();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý Sự kiện & Talkshow
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Tổ chức các buổi tọa đàm, kết nối diễn giả cựu sinh viên và theo dõi
            điểm danh người tham dự
          </p>
        </div>

        <Link
          href="/faculty-admin/events/new"
          className={cn(
            "flex items-center gap-1.5",
            buttonVariants({ size: "sm" }),
          )}
        >
          <PlusCircle />
          Tạo sự kiện mới
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center text-xs text-muted-foreground space-y-2">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-2" />
              <p className="font-semibold text-foreground text-sm">
                Chưa có sự kiện nào
              </p>

              <Link
                href="/faculty-admin/events/new"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Tạo sự kiện đầu tiên
              </Link>
            </CardContent>
          </Card>
        ) : (
          events.map((ev) => (
            <Card
              key={ev.id}
              className="shadow-sm flex flex-col justify-between"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {ev.type}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {ev.format === "online" ? "Trực tuyến" : "Trực tiếp"}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold leading-snug">
                  <Link href={`/events/${ev.id}`}>{ev.title}</Link>
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {ev.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground pb-3">
                <div className="flex items-center gap-1.5 text-[11px] text-foreground font-medium">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {new Date(ev.startTime).toLocaleString("vi-VN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  {ev.format === "online" ? (
                    <Video className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="truncate">{ev.locationOrLink}</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] pt-1 border-t border-border">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {ev.registrations.length} lượt đăng ký
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    {ev.speakers.length} diễn giả cựu SV
                  </span>
                </div>
              </CardContent>
              <div className="p-3 bg-muted/20 border-t border-border flex justify-end gap-2">
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                  )}
                  href={`/faculty-admin/events/${ev.id}/speakers`}
                >
                  Mời diễn giả Cựu SV
                </Link>

                <Link
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                  )}
                  href={`/events/${ev.id}`}
                >
                  Xem chi tiết
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FacultyEventsPage;
