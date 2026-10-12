import { Bell } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getMyNotifications } from "@/actions/notification-actions";
import { EmptyBlock } from "@/components/landing/landing-parts";
import { buttonVariants } from "@/components/ui/button";
import { requireRoleOrRedirect } from "@/lib/permissions";
import { formatDateVi, formatRelativeVi, formatTimeVi } from "@/lib/text";
import { cn } from "@/lib/utils";
import { MarkAllButton } from "./mark-all-button";
import { NotificationRow } from "./notification-item";

export const metadata: Metadata = {
  title: "Thông báo",
};

const PAGE_SIZE = 20;

interface NotificationsPageProps {
  searchParams: Promise<{ filter?: string; page?: string }>;
}

const buildHref = (filter: "all" | "unread", page = 1) => {
  const query = new URLSearchParams();
  if (filter === "unread") query.set("filter", "unread");
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return qs ? `/account/notifications?${qs}` : "/account/notifications";
};

const NotificationsPage = async ({ searchParams }: NotificationsPageProps) => {
  await requireRoleOrRedirect([
    "student",
    "alumni",
    "employer",
    "faculty_staff",
    "admin",
  ]);

  const params = await searchParams;
  const filter = params.filter === "unread" ? "unread" : "all";
  const page = Math.max(Number.parseInt(params.page ?? "1", 10) || 1, 1);

  const { items, total, unread } = await getMyNotifications({
    unreadOnly: filter === "unread",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
            Thông báo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0
              ? `Bạn có ${unread} thông báo chưa đọc.`
              : "Bạn đã đọc hết thông báo."}
          </p>
        </div>
        <MarkAllButton disabled={unread === 0} />
      </header>

      <nav aria-label="Lọc thông báo" className="flex gap-2">
        {(
          [
            ["all", "Tất cả"],
            ["unread", "Chưa đọc"],
          ] as const
        ).map(([value, label]) => (
          <Link
            key={value}
            href={buildHref(value)}
            aria-current={filter === value ? "page" : undefined}
            className={cn(
              buttonVariants({
                variant: filter === value ? "default" : "outline",
                size: "sm",
              }),
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <EmptyBlock
          icon={Bell}
          title={
            filter === "unread"
              ? "Không có thông báo chưa đọc"
              : "Chưa có thông báo nào"
          }
          description="Thông báo về duyệt bài, sự kiện, học bổng và lời mời sẽ xuất hiện tại đây."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border-strong overflow-hidden rounded-xl border border-border-strong bg-card">
          {items.map((n) => (
            <NotificationRow
              key={n.id}
              id={n.id}
              title={n.title}
              body={n.body}
              linkUrl={n.linkUrl}
              isRead={n.isRead}
              timeLabel={`${formatRelativeVi(n.createdAt)} · ${formatDateVi(n.createdAt)} ${formatTimeVi(n.createdAt)}`}
            />
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Phân trang"
          className="flex items-center justify-between gap-3 text-sm"
        >
          {page > 1 ? (
            <Link
              href={buildHref(filter, page - 1)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Trang trước
            </Link>
          ) : (
            <span />
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {page}/{totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={buildHref(filter, page + 1)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Trang sau
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
};

export default NotificationsPage;
