"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { inviteSpeaker } from "@/actions/event-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import type { AlumniSpeakerCandidate } from "@/actions/event-actions";

interface InviteSpeakerFormProps {
  eventId: string;
  alumniList: AlumniSpeakerCandidate[];
}

export const InviteSpeakerForm = ({
  eventId,
  alumniList,
}: InviteSpeakerFormProps) => {
  const router = useRouter();
  const [alumniUserId, setAlumniUserId] = React.useState(
    alumniList[0]?.userId || "",
  );
  const [note, setNote] = React.useState(
    "Trân trọng kính mời Anh/Chị tham gia chia sẻ kinh nghiệm cùng các bạn sinh viên Khoa CNTT.",
  );
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await inviteSpeaker({
        eventId,
        alumniUserId,
        note,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi gửi lời mời";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (alumniList.length === 0) {
    return (
      <div className="text-center py-4 text-xs text-muted-foreground">
        Chưa có tài khoản cựu sinh viên nào trong hệ thống.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-2 text-xs">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          <AlertDescription>Đã gửi lời mời thành công!</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="alumniSelect" className="text-xs font-medium">
          Chọn Cựu sinh viên
        </Label>
        <select
          id="alumniSelect"
          value={alumniUserId}
          onChange={(e) => setAlumniUserId(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          required
          disabled={isLoading}
        >
          {alumniList.map((al) => (
            <option key={al.userId} value={al.userId}>
              {al.fullName} {al.batchYear ? `(K${al.batchYear})` : ""} -{" "}
              {al.user?.email}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inviteNote" className="text-xs font-medium">
          Lời nhắn / Chủ đề dự kiến
        </Label>
        <Textarea
          id="inviteNote"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isLoading}
          className="text-xs leading-relaxed"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full text-xs font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            Đang gửi lời mời...
          </>
        ) : (
          <>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Gửi lời mời Diễn giả
          </>
        )}
      </Button>
    </form>
  );
};
