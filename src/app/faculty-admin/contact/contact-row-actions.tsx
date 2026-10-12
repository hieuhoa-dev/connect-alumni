"use client";

import { MailCheck, MailOpen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  deleteContactMessage,
  setContactMessageRead,
} from "@/actions/contact-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export const ContactRowActions = ({
  id,
  isRead,
  email,
  subject,
}: {
  id: string;
  isRead: boolean;
  email: string;
  subject: string;
}) => {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const run = async (task: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await task();
      toast.add({ type: "success", description: success });
      router.refresh();
    } catch (err) {
      toast.add({
        type: "error",
        description: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        render={
          // biome-ignore lint/a11y/useAnchorContent: nội dung do Button truyền vào thẻ a qua render
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${subject}`)}`}
          />
        }
        nativeButton={false}
        variant="outline"
        size="sm"
      >
        Trả lời qua email
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={busy}
        aria-label={isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
        onClick={() =>
          run(
            () => setContactMessageRead(id, !isRead),
            isRead ? "Đã đánh dấu chưa đọc" : "Đã đánh dấu đã đọc",
          )
        }
      >
        {isRead ? <MailOpen /> : <MailCheck />}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Xóa"
              className="text-destructive"
              disabled={busy}
            />
          }
        >
          <Trash2 />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tin nhắn này?</AlertDialogTitle>
            <AlertDialogDescription>
              Tin nhắn "{subject}" sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                run(() => deleteContactMessage(id), "Đã xóa tin nhắn")
              }
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
