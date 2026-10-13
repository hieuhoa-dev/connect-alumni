"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { markAllNotificationsRead } from "@/actions/notification-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { getInternalHref } from "@/lib/internal-href";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

export interface NotificationsPopoverProps {
  notifications?: NotificationItem[];
  side?: "bottom" | "right" | "top" | "left";
  align?: "start" | "end" | "center";
  sideOffset?: number;
  triggerClassName?: string;
  isSidebarItem?: boolean;
}

export const NotificationsPopover = ({
  notifications: initialNotifications = [],
  side = "bottom",
  align = "end",
  sideOffset = 8,
  triggerClassName,
  isSidebarItem = false,
}: NotificationsPopoverProps) => {
  const [items, setItems] = React.useState(initialNotifications);
  const [isMarking, startMarking] = React.useTransition();

  React.useEffect(() => {
    setItems(initialNotifications);
  }, [initialNotifications]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    // Cập nhật giao diện ngay, rồi lưu vào CSDL để lần tải sau không bị hiện lại
    const previous = new Map(items.map((item) => [item.id, item.isRead]));
    startMarking(async () => {
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      try {
        await markAllNotificationsRead();
      } catch {
        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            isRead: previous.get(item.id) ?? item.isRead,
          })),
        );
        toast.add({
          type: "error",
          description: "Chưa thể đánh dấu thông báo đã đọc. Vui lòng thử lại.",
        });
      }
    });
  };

  return (
    <DropdownMenu>
      {isSidebarItem ? (
        <DropdownMenuTrigger
          className={cn(
            "relative flex min-h-9 w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-xl px-3 text-left text-sm font-medium outline-none",
            "text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/70",
            "focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
            triggerClassName,
          )}
          aria-label="Thông báo hệ thống"
          title={
            unreadCount > 0 ? `Thông báo (${unreadCount} mới)` : "Thông báo"
          }
        >
          <span
            aria-hidden="true"
            className="relative z-10 grid size-5 shrink-0 place-items-center"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex size-2 rounded-full bg-destructive ring-2 ring-card" />
            )}
          </span>
          <span className="relative z-10 min-w-0 flex-1 truncate group-data-[state=collapsed]/sidebar:hidden">
            Thông báo
          </span>
          {unreadCount > 0 && (
            <span className="relative z-10 shrink-0 rounded-full border border-destructive/20 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-destructive group-data-[state=collapsed]/sidebar:hidden">
              {unreadCount}
            </span>
          )}
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "relative cursor-pointer",
            triggerClassName,
          )}
          aria-label="Thông báo"
        >
          <Bell className="size-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </DropdownMenuTrigger>
      )}

      <DropdownMenuContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="w-80 sm:w-96 p-0 shadow-lg border border-border/80"
      >
        <div className="flex items-center justify-between p-3 border-b border-border/70 bg-card">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-tight text-foreground uppercase">
              Thông báo hệ thống
            </span>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] font-mono h-5 px-1.5"
              >
                {unreadCount} mới
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={isMarking}
              className="text-xs h-7 text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Đánh dấu đã đọc
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
          {items.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground font-mono">
              Bạn chưa có thông báo mới nào.
            </div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className={`p-3 text-xs transition-colors hover:bg-muted/50 ${
                  !n.isRead ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-foreground text-xs leading-snug">
                    {n.title}
                  </div>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-muted-foreground mt-1 line-clamp-2 leading-relaxed text-[11px]">
                  {n.body}
                </p>
                {getInternalHref(n.linkUrl) && (
                  <Link
                    href={
                      getInternalHref(n.linkUrl) ?? "/account/notifications"
                    }
                    className="inline-block mt-2 text-primary font-medium hover:underline text-[11px]"
                  >
                    Xem chi tiết →
                  </Link>
                )}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border/70 bg-card p-2">
          <Link
            href="/account/notifications"
            className="flex h-8 items-center justify-center rounded-lg text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            Xem tất cả thông báo
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
