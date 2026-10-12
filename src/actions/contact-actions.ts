"use server";

import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { requireRole } from "@/lib/permissions";
import { type ContactInput, contactSchema } from "@/validators/contact-schema";

const MAX_PER_EMAIL_PER_HOUR = 3;
const MAX_TOTAL_PER_HOUR = 60;

/**
 * Public: gửi tin nhắn liên hệ tới Khoa.
 * Đây là endpoint công khai nên có ba lớp chống spam:
 * ô ẩn (honeypot), giới hạn 3 tin/giờ cho mỗi email và 60 tin/giờ toàn hệ thống.
 */
export const submitContactMessage = async (input: ContactInput) => {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    // Honeypot bị điền: trả về như thành công để bot không biết bị chặn
    if (typeof input?.website === "string" && input.website.length > 0) {
      return { success: true as const };
    }
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
  }
  const data = parsed.data;
  const email = data.email.toLowerCase();
  await db.transaction(
    async (tx) => {
      // Cùng khóa toàn hệ thống cho việc đếm và ghi, kể cả khi các email khác nhau.
      // PostgreSQL tự nhả khóa khi transaction commit hoặc rollback.
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext(${"connect-alumni:contact-messages"}))`,
      );
      const since = new Date(Date.now() - 60 * 60 * 1000);

      const [perEmail, total] = await Promise.all([
        tx
          .select({ value: count() })
          .from(contactMessages)
          .where(
            and(
              eq(contactMessages.email, email),
              gte(contactMessages.createdAt, since),
            ),
          ),
        tx
          .select({ value: count() })
          .from(contactMessages)
          .where(gte(contactMessages.createdAt, since)),
      ]);

      if (
        Number(perEmail[0]?.value ?? 0) >= MAX_PER_EMAIL_PER_HOUR ||
        Number(total[0]?.value ?? 0) >= MAX_TOTAL_PER_HOUR
      ) {
        throw new Error(
          "Bạn đã gửi nhiều tin nhắn trong thời gian ngắn. Vui lòng thử lại sau.",
        );
      }

      await tx.insert(contactMessages).values({
        name: data.name,
        email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
      });
    },
    { isolationLevel: "read committed" },
  );

  return { success: true as const };
};

/** Faculty/Admin: danh sách tin nhắn liên hệ, tin chưa đọc lên trước. */
export const getContactMessages = async () => {
  await requireRole(["faculty_staff", "admin"]);

  return await db
    .select()
    .from(contactMessages)
    .orderBy(contactMessages.isRead, desc(contactMessages.createdAt))
    .limit(200);
};

/** Faculty/Admin: số tin chưa đọc (dùng cho huy hiệu trên menu). */
export const getUnreadContactCount = async () => {
  await requireRole(["faculty_staff", "admin"]);

  const [row] = await db
    .select({ value: count() })
    .from(contactMessages)
    .where(eq(contactMessages.isRead, false));
  return Number(row?.value ?? 0);
};

export const setContactMessageRead = async (id: string, isRead: boolean) => {
  await requireRole(["faculty_staff", "admin"]);

  const [updated] = await db
    .update(contactMessages)
    .set({ isRead })
    .where(eq(contactMessages.id, id))
    .returning();
  if (!updated) throw new Error("Không tìm thấy tin nhắn");
  return updated;
};

export const deleteContactMessage = async (id: string) => {
  const current = await requireRole(["faculty_staff", "admin"]);

  const [removed] = await db
    .delete(contactMessages)
    .where(eq(contactMessages.id, id))
    .returning({ id: contactMessages.id });
  if (!removed) throw new Error("Không tìm thấy tin nhắn");

  await logAuditEvent({
    actorId: current.user.id,
    action: "delete_contact_message",
    entityType: "contact_message",
    entityId: id,
  });
  return { success: true };
};
