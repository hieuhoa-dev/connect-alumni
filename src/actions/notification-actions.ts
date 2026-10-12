"use server";

import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireActiveUser } from "@/lib/permissions";
import { getPagination } from "@/lib/query-input";

/**
 * Danh sách thông báo của chính người dùng đang đăng nhập.
 * Mọi truy vấn đều ràng buộc theo userId của phiên, không nhận userId từ client.
 */
export const getMyNotifications = async (params?: {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}) => {
  const current = await requireActiveUser();
  const { limit, offset } = getPagination(params);

  const where = params?.unreadOnly
    ? and(
        eq(notifications.userId, current.user.id),
        eq(notifications.isRead, false),
      )
    : eq(notifications.userId, current.user.id);

  const [items, [totalRow], [unreadRow]] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(notifications).where(where),
    db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, current.user.id),
          eq(notifications.isRead, false),
        ),
      ),
  ]);

  return {
    items,
    total: Number(totalRow?.value ?? 0),
    unread: Number(unreadRow?.value ?? 0),
  };
};

export const markNotificationRead = async (id: string, isRead = true) => {
  const current = await requireActiveUser();

  const [updated] = await db
    .update(notifications)
    .set({ isRead })
    .where(
      and(eq(notifications.id, id), eq(notifications.userId, current.user.id)),
    )
    .returning({ id: notifications.id });

  if (!updated) throw new Error("Không tìm thấy thông báo");
  return { success: true as const };
};

export const markAllNotificationsRead = async () => {
  const current = await requireActiveUser();

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, current.user.id),
        eq(notifications.isRead, false),
      ),
    );

  return { success: true as const };
};

export const deleteNotification = async (id: string) => {
  const current = await requireActiveUser();

  const [removed] = await db
    .delete(notifications)
    .where(
      and(eq(notifications.id, id), eq(notifications.userId, current.user.id)),
    )
    .returning({ id: notifications.id });

  if (!removed) throw new Error("Không tìm thấy thông báo");
  return { success: true as const };
};
