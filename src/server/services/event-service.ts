import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { eventRegistrations } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { getCurrentUser } from "@/lib/permissions";
import { fail, ok, type Result } from "@/lib/result";

export class EventService {
  /**
   * Register the current user for an event safely under concurrency.
   * Uses database transaction with row-level lock (FOR UPDATE) or atomic conditional counting.
   */
  async registerForEvent(
    eventId: string,
  ): Promise<Result<{ registered: boolean; registrationId: string }>> {
    const current = await getCurrentUser();
    if (!current?.user) {
      return fail(
        "UNAUTHORIZED",
        "Vui lòng đăng nhập để đăng ký tham gia sự kiện.",
      );
    }

    const userId = current.user.id;
    const profile = current.profile;

    if (!profile) {
      return fail(
        "PROFILE_REQUIRED",
        "Tài khoản của bạn chưa hoàn tất hồ sơ cá nhân.",
      );
    }

    if (profile.status !== "active") {
      return fail(
        "FORBIDDEN",
        "Tài khoản của bạn hiện không ở trạng thái hoạt động.",
      );
    }

    // Role check: student or alumni (alumni must be verified)
    if (profile.role !== "student" && profile.role !== "alumni") {
      return fail(
        "FORBIDDEN",
        "Chỉ sinh viên hoặc cựu sinh viên mới có thể đăng ký tham gia sự kiện.",
      );
    }

    if (
      profile.role === "alumni" &&
      !("alumniVerifiedAt" in profile && profile.alumniVerifiedAt)
    ) {
      return fail(
        "FORBIDDEN",
        "Hồ sơ cựu sinh viên của bạn đang chờ xác thực. Vui lòng chờ Khoa duyệt hồ sơ trước khi đăng ký.",
      );
    }

    const now = new Date();

    return await db.transaction(async (tx) => {
      // 1. Lock the event row for concurrency safety
      const lockedEventResult = await tx.execute(sql`
        SELECT id, title, status, capacity, start_time, end_time
        FROM events
        WHERE id = ${eventId}
        FOR UPDATE
      `);

      const eventItem = lockedEventResult.rows[0] as
        | {
            id: string;
            title: string;
            status: string;
            capacity: number | null;
            start_time: Date;
            end_time: Date;
          }
        | undefined;

      if (!eventItem) {
        return fail("NOT_FOUND", "Không tìm thấy thông tin sự kiện.");
      }

      if (eventItem.status !== "published") {
        return fail(
          "CONFLICT",
          "Sự kiện hiện chưa mở hoặc đã kết thúc đăng ký.",
        );
      }

      const eventEndTime = new Date(eventItem.end_time || eventItem.start_time);
      if (now > eventEndTime) {
        return fail("CONFLICT", "Sự kiện đã kết thúc thời hạn đăng ký.");
      }

      // 2. Check if user already registered
      const [existingReg] = await tx
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, eventId),
            eq(eventRegistrations.userId, userId),
          ),
        )
        .limit(1);

      if (existingReg) {
        return fail("CONFLICT", "Bạn đã đăng ký tham gia sự kiện này rồi.");
      }

      // 3. Check capacity under lock
      if (eventItem.capacity && eventItem.capacity > 0) {
        const [regCountRes] = await tx
          .select({ count: count() })
          .from(eventRegistrations)
          .where(eq(eventRegistrations.eventId, eventId));

        const currentCount = Number(regCountRes?.count || 0);
        if (currentCount >= eventItem.capacity) {
          return fail(
            "CONFLICT",
            "Sự kiện đã đủ số lượng người tham dự (hết chỗ).",
          );
        }
      }

      // 4. Insert registration
      const [newReg] = await tx
        .insert(eventRegistrations)
        .values({
          eventId,
          userId,
          attendanceStatus: "registered",
        })
        .returning();

      // 5. Log audit
      await logAuditEvent({
        actorId: userId,
        action: "register_event",
        entityType: "event",
        entityId: eventId,
        metadata: {
          eventTitle: eventItem.title,
          registeredAt: new Date().toISOString(),
        },
      });

      return ok({
        registered: true,
        registrationId: newReg.id,
      });
    });
  }

  /**
   * Cancel event registration
   */
  async cancelRegistration(
    eventId: string,
  ): Promise<Result<{ cancelled: boolean }>> {
    const current = await getCurrentUser();
    if (!current?.user) {
      return fail("UNAUTHORIZED", "Vui lòng đăng nhập để hủy đăng ký sự kiện.");
    }

    const userId = current.user.id;

    const [deleted] = await db
      .delete(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, userId),
        ),
      )
      .returning();

    if (!deleted) {
      return fail("NOT_FOUND", "Bạn chưa đăng ký tham gia sự kiện này.");
    }

    await logAuditEvent({
      actorId: userId,
      action: "cancel_event_registration",
      entityType: "event",
      entityId: eventId,
    });

    return ok({ cancelled: true });
  }
}

export const eventService = new EventService();
