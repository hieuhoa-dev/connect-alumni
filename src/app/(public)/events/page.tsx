import Link from "next/link";
import { getPublishedEvents } from "@/actions/event-actions";
import { Button, buttonVariants } from "@/components/ui/button";
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
              className="group flex flex-col justify-between overflow-hidden rounded-[24px] border border-border/70 bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg"
            >
              <div>
                {/* Khung ảnh tỷ lệ cố định 16:10 hoặc 16:9 bo góc riêng biệt */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[18px] bg-gradient-to-br from-muted/60 to-muted">
                  {event.coverImageUrl ? (
                    <img
                      src={event.coverImageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground/60">
                      <CalendarDays className="size-7" />
                      <span className="text-[11px] font-medium">Sự kiện</span>
                    </div>
                  )}

                  {/* Badges đè trên ảnh với nền mờ có viền để luôn đọc rõ trên mọi nền */}
                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                    <span className="rounded-full border border-black/5 bg-background/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground shadow-sm backdrop-blur-md dark:border-white/10">
                      {event.type}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-medium shadow-sm backdrop-blur-md",
                        event.format === "online"
                          ? "bg-blue-600/90 text-white"
                          : "bg-emerald-600/90 text-white",
                      )}
                    >
                      {event.format === "online" ? "Trực tuyến" : "Trực tiếp"}
                    </span>
                  </div>
                </div>

                {/* Nội dung thông tin bên dưới */}
                <div className="px-1.5 pt-3.5">
                  <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
                    <Link href={`/events/${event.id}`}>{event.title}</Link>
                  </h3>

                  <p className="mt-1.5 line-clamp-2 break-all text-xs leading-relaxed text-muted-foreground">
                    {event.description || "Chưa có mô tả cho sự kiện này."}
                  </p>

                  {/* Meta info: Ngày giờ & Địa điểm */}
                  <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="font-mono">
                        {new Date(event.startTime).toLocaleString("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">
                        {event.locationOrLink || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer chứa nút bo cong kiểu Capsule */}
              <div className="mt-4 border-t border-border/40 px-1 pt-3">
                <Link
                  href={`/events/${event.id}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "w-full h-9 rounded-full font-medium text-xs shadow-none transition active:scale-[0.98]",
                  )}
                >
                  Đăng ký tham gia{" "}
                  {event.registrations?.length > 0 &&
                    `(${event.registrations.length})`}
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsPage;
