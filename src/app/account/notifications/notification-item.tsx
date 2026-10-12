"use client";

import { Check, Circle, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  deleteNotification,
  markNotificationRead,
} from "@/actions/notification-actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  id: string;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  timeLabel: string;
}

export const NotificationRow = ({
  id,
  title,
  body,
  linkUrl,
  isRead,
  timeLabel,
}: NotificationItemProps) => {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const run = async (task: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await task();
      router.refresh();
    } catch (err) {
      toast.add({
        type: "error",
        description: err instanceof Error ? err.message : "Thao tác thất bại",
      });
    } finally {
      setBusy(false);
    }
  };

  // Chỉ chấp nhận liên kết nội bộ, tránh thông báo trỏ ra trang ngoài
  const safeLink =
    linkUrl?.startsWith("/") && !linkUrl.startsWith("//") ? linkUrl : null;

  return (
    <li
      className={cn(
        "flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between",
        !isRead && "bg-muted/40",
      )}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        <Circle
          aria-hidden
          className={cn(
            "mt-1.5 size-2 shrink-0",
            isRead
              ? "fill-transparent text-transparent"
              : "fill-foreground text-foreground",
          )}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <h2
            className={cn(
              "text-sm text-foreground",
              isRead ? "font-normal" : "font-semibold",
            )}
          >
            {title}
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {body}
          </p>
          <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
            <time className="font-mono">{timeLabel}</time>
            {safeLink && (
              <Link
                href={safeLink}
                onClick={() => {
                  if (!isRead) void markNotificationRead(id).catch(() => {});
                }}
                className="font-medium text-foreground underline underline-offset-4"
              >
                Xem chi tiết
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 pl-5 sm:pl-0">
        {busy ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => run(() => markNotificationRead(id, !isRead))}
            >
              <Check data-icon="inline-start" />
              {isRead ? "Đánh dấu chưa đọc" : "Đã đọc"}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Xóa thông báo"
              onClick={() => run(() => deleteNotification(id))}
            >
              <Trash2 />
            </Button>
          </>
        )}
      </div>
    </li>
  );
};
