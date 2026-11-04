import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPublishedEvents } from "@/actions/event-actions";
import { buttonVariants } from "@/components/ui/button";
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
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Video,
} from "lucide-react";
import { ContentImage } from "@/components/shared/content-image";

export const dynamic = "force-dynamic";

const EventsPage = async () => {
  let events: any[] = [];
  try {
    events = (await getPublishedEvents()) || [];
  } catch (err) {
    console.warn("[EventsPage] Database unavailable during fetch, defaulting to empty list:", err);
  }
  const displayEvents = events;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-pine-800">
          Talkshow, Hội thảo &amp; Sự kiện — Đại học Đà Lạt
        </h1>
        <p className="text-sm text-muted-foreground">
          Các chương trình kết nối định kỳ giữa Cựu sinh viên, Trường Đại học Đà Lạt và Sinh viên
          nhằm chia sẻ kinh nghiệm và kết nối tương lai
        </p>
      </div>

      {/* Events Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayEvents.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card border border-dashed rounded-xl">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-foreground">
              Hiện chưa có sự kiện nào sắp diễn ra
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Nhà trường sẽ sớm cập nhật lịch talkshow và hội thảo mới nhất.
            </p>
          </div>
        ) : (
          displayEvents.map((event) => (
            <Card
              key={event.id}
              className="flex flex-col justify-between overflow-hidden hover:border-primary/50 transition shadow-sm group"
            >
              {/* Cover image */}
              <div
                data-slot="card-image"
                className="relative aspect-video w-full bg-muted overflow-hidden"
              >
                <ContentImage
                  file={event.coverImageUrl}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                    {event.type}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>
                    {new Date(event.startTime).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <CardTitle className="text-base font-bold leading-snug line-clamp-2">
                  <Link href={`/events/${event.id}`}>{event.title}</Link>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 pb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {new Date(event.startTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  {event.format === "online" ? (
                    <Video className="h-3.5 w-3.5 shrink-0 text-blue-500 mt-0.5" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                  )}
                  <span className="line-clamp-1">
                    {event.locationOrLink || "Đại học Đà Lạt"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>{event.registrations?.length || 0} người tham gia</span>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Link
                  href={`/events/${event.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full",
                  )}
                >
                  Xem chi tiết &amp; Đăng ký
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsPage;
