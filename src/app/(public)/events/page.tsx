import Link from "next/link";
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
  Clock,
  MapPin,
  Users,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EventsPage = async () => {
  const events = await getPublishedEvents();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Talkshow, Hội thảo & Sự kiện
        </h1>
        <p className="text-sm text-muted-foreground">
          Các chương trình kết nối định kỳ giữa Cựu sinh viên, Khoa và Sinh viên
          nhằm chia sẻ kinh nghiệm thực tế
        </p>
      </div>

      {/* Events Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card border border-dashed rounded-xl">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-foreground">
              Hiện chưa có sự kiện nào sắp diễn ra
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Khoa sẽ sớm cập nhật lịch talkshow và hội thảo mới nhất.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden flex flex-col justify-between hover:border-primary/50 transition shadow-sm"
            >
              <div>
                {event.coverImageUrl && (
                  <div className="h-44 w-full overflow-hidden bg-muted">
                    <img
                      src={event.coverImageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-semibold"
                    >
                      {event.type}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {event.format === "online" ? "Trực tuyến" : "Trực tiếp"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold leading-snug">
                    <Link href={`/events/${event.id}`}>{event.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground pb-3">
                  <p className="line-clamp-2">{event.description}</p>
                  <div className="space-y-1.5 text-[11px] pt-1">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {new Date(event.startTime).toLocaleString("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.format === "online" ? (
                        <Video className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="truncate">{event.locationOrLink}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {event.registrations.length} đã đăng ký
                </span>

                <Link
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                  )}
                  href={`/events/${event.id}`}
                >
                  Xem chi tiết
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
