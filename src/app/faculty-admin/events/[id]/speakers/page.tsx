import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById, getAlumniForSpeakerInvitation } from "@/actions/event-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Sparkles, UserPlus, Users } from "lucide-react";
import { InviteSpeakerForm } from "./invite-speaker-form";

interface SpeakersPageProps {
  params: Promise<{ id: string }>;
}

const EventSpeakersPage = async ({ params }: SpeakersPageProps) => {
  const { id } = await params;
  const [event, allAlumni] = await Promise.all([
    getEventById(id),
    getAlumniForSpeakerInvitation(),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/faculty-admin/events" />}
          nativeButton={false}
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách sự kiện
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quản lý Diễn giả Cựu sinh viên
        </h1>
        <p className="text-xs text-muted-foreground">
          Sự kiện: <strong>{event.title}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Invited Speakers (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Danh sách Diễn giả đã mời ({event.speakers.length})
          </h2>

          {event.speakers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-xs text-muted-foreground">
                Chưa có cựu sinh viên nào được mời cho sự kiện này.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {event.speakers.map((sp) => {
                if (!sp.alumni) return null;
                const profile = sp.alumni.profile;
                return (
                  <Card key={sp.id} className="p-4 shadow-sm border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-foreground text-sm">
                          {profile?.fullName || sp.alumni?.name}
                        </div>
                        <div className="text-muted-foreground text-[11px]">
                          {sp.alumni?.email} ·{" "}
                          {profile?.batchYear
                            ? `Khóa ${profile.batchYear}`
                            : "Alumni"}
                        </div>
                        {profile?.bio && (
                          <p className="text-muted-foreground text-[11px] line-clamp-1">
                            {profile.bio}
                          </p>
                        )}
                        {sp.note && (
                          <p className="text-primary text-[11px] italic mt-1">
                            Lời nhắn: "{sp.note}"
                          </p>
                        )}
                      </div>

                      <Badge
                        className={
                          sp.invitationStatus === "accepted"
                            ? "bg-emerald-600 text-white text-[10px]"
                            : sp.invitationStatus === "declined"
                              ? "bg-destructive text-destructive-foreground text-[10px]"
                              : "bg-amber-600 text-white text-[10px]"
                        }
                      >
                        {sp.invitationStatus === "accepted"
                          ? "Đã nhận lời"
                          : sp.invitationStatus === "declined"
                            ? "Đã từ chối"
                            : "Đang chờ phản hồi"}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Invite Form (1 col) */}
        <div>
          <Card className="shadow-sm border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Gửi lời mời mới</span>
              </div>
              <CardTitle className="text-base font-bold">
                Mời Cựu sinh viên
              </CardTitle>
              <CardDescription className="text-xs">
                Hệ thống sẽ gửi thông báo in-app và email mời cựu SV làm diễn
                giả.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InviteSpeakerForm eventId={event.id} alumniList={allAlumni} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventSpeakersPage;
