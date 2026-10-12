"use server";

import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  eventRegistrations,
  eventSpeakers,
  events,
  profiles,
} from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import { isEntityId } from "@/lib/query-input";
import { sanitizeRichHtml } from "@/lib/sanitize";
import {
  attendanceStatusSchema,
  type EventCreateInput,
  eventCreateSchema,
  type SpeakerInviteInput,
  speakerInviteSchema,
  speakerResponseSchema,
} from "@/validators/event-schema";

/**
 * Cột công khai của người dùng/hồ sơ: không có email, SĐT, MSSV.
 * Dùng chung cho mọi truy vấn trả dữ liệu ra trang công khai.
 */
const PUBLIC_USER_COLUMNS = { id: true, name: true } as const;
const PUBLIC_PROFILE_COLUMNS = {
  fullName: true,
  batchYear: true,
  avatarUrl: true,
  bio: true,
} as const;

/**
 * Public: Get published events
 * Không trả danh sách người đăng ký, chỉ trả mã đăng ký để đếm số lượng.
 */
export const getPublishedEvents = async () => {
  const now = new Date();

  return await db.query.events.findMany({
    where: {
      status: "published",
      endTime: { gt: now },
    },
    with: {
      creator: {
        columns: PUBLIC_USER_COLUMNS,
        with: { profile: { columns: PUBLIC_PROFILE_COLUMNS } },
      },
      // Chỉ công khai các diễn giả đã nhận lời
      speakers: {
        where: { invitationStatus: "accepted" },
        with: {
          alumni: {
            columns: PUBLIC_USER_COLUMNS,
            with: { profile: { columns: PUBLIC_PROFILE_COLUMNS } },
          },
        },
      },
      registrations: { columns: { id: true } },
    },
    orderBy: {
      startTime: "asc",
    },
  });
};

/** Faculty/Admin: list every event, including drafts and closed events. */
export const getManagedEvents = async () => {
  await requireRole(["faculty_staff", "admin"]);

  return await db.query.events.findMany({
    with: {
      speakers: {
        with: {
          alumni: {
            columns: PUBLIC_USER_COLUMNS,
            with: { profile: { columns: PUBLIC_PROFILE_COLUMNS } },
          },
        },
      },
      registrations: { columns: { id: true } },
    },
    orderBy: {
      startTime: "desc",
    },
  });
};

/**
 * Get event details by ID (dữ liệu công khai)
 * - Sự kiện nháp chỉ nhân viên Khoa xem được.
 * - Không trả thông tin người đăng ký; trả isRegistered cho riêng người đang xem.
 */
export const getEventById = async (id: string) => {
  if (!isEntityId(id)) return null;
  const [event, current] = await Promise.all([
    db.query.events.findFirst({
      where: {
        id: id,
      },
      with: {
        creator: {
          columns: PUBLIC_USER_COLUMNS,
          with: { profile: { columns: PUBLIC_PROFILE_COLUMNS } },
        },
        speakers: {
          where: { invitationStatus: "accepted" },
          with: {
            alumni: {
              columns: PUBLIC_USER_COLUMNS,
              with: { profile: { columns: PUBLIC_PROFILE_COLUMNS } },
            },
          },
        },
        registrations: { columns: { id: true, userId: true } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!event) return null;

  const isStaff =
    current?.role === "faculty_staff" || current?.role === "admin";
  if (event.status === "draft" && !isStaff) return null;

  const isRegistered = current?.user
    ? event.registrations.some((r) => r.userId === current.user.id)
    : false;

  return {
    ...event,
    registrations: event.registrations.map((r) => ({ id: r.id })),
    isRegistered,
  };
};

/**
 * Faculty/Admin: chi tiết đầy đủ của sự kiện (gồm tất cả lời mời diễn giả, email diễn giả)
 */
export const getEventByIdForStaff = async (id: string) => {
  await requireRole(["faculty_staff", "admin"]);
  if (!isEntityId(id)) return undefined;

  return await db.query.events.findFirst({
    where: {
      id: id,
    },
    with: {
      creator: {
        with: {
          profile: true,
        },
      },
      speakers: {
        with: {
          alumni: {
            with: {
              profile: true,
            },
          },
        },
      },
      registrations: {
        with: {
          user: {
            with: {
              profile: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Faculty/Admin: Create a new event
 */
export const createEvent = async (input: EventCreateInput) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validated = eventCreateSchema.parse(input);

  const [newEvent] = await db
    .insert(events)
    .values({
      type: validated.type,
      title: validated.title,
      description: sanitizeRichHtml(validated.description),
      format: validated.format,
      locationOrLink: validated.locationOrLink,
      startTime: validated.startTime,
      endTime: validated.endTime,
      capacity: validated.capacity || null,
      coverImageUrl: validated.coverImageUrl || null,
      status: validated.status,
      createdBy: current.user.id,
    })
    .returning();

  await logAuditEvent({
    actorId: current.user.id,
    action: "create_event",
    entityType: "event",
    entityId: newEvent.id,
    metadata: { title: newEvent.title },
  });

  return newEvent;
};

/**
 * Faculty/Admin: Invite Alumni as speaker
 */
export const inviteSpeaker = async (input: SpeakerInviteInput) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validated = speakerInviteSchema.parse(input);

  const eventItem = await db.query.events.findFirst({
    where: { id: validated.eventId },
  });
  if (!eventItem) throw new Error("Không tìm thấy sự kiện");
  if (
    eventItem.status === "cancelled" ||
    eventItem.status === "completed" ||
    eventItem.endTime <= new Date()
  ) {
    throw new Error("Sự kiện không còn nhận lời mời diễn giả");
  }

  // Chỉ mời người có vai trò cựu sinh viên, và không mời trùng
  const [alumniProfile] = await db
    .select({ role: profiles.role, status: profiles.status })
    .from(profiles)
    .where(eq(profiles.userId, validated.alumniUserId));
  if (alumniProfile?.role !== "alumni" || alumniProfile.status !== "active") {
    throw new Error("Chỉ có thể mời cựu sinh viên làm diễn giả");
  }

  const existingInvite = await db.query.eventSpeakers.findFirst({
    where: {
      eventId: validated.eventId,
      alumniUserId: validated.alumniUserId,
    },
  });
  if (existingInvite) {
    throw new Error("Cựu sinh viên này đã được mời cho sự kiện");
  }

  const [invitation] = await db
    .insert(eventSpeakers)
    .values({
      eventId: validated.eventId,
      alumniUserId: validated.alumniUserId,
      note: validated.note || null,
      invitationStatus: "pending",
    })
    .onConflictDoNothing()
    .returning();
  if (!invitation) {
    throw new Error("Cựu sinh viên này đã được mời cho sự kiện");
  }

  // Notify Alumni
  await sendNotification({
    userId: validated.alumniUserId,
    type: "speaker_invitation",
    title: `Lời mời diễn giả: "${eventItem?.title || "Sự kiện Khoa"}"`,
    body: `Khoa trân trọng kính mời bạn tham gia làm diễn giả/khách mời sự kiện. Lời nhắn: ${validated.note || "Không có ghi chú"}.`,
    linkUrl: "/student/events/my-registrations",
    sendEmail: true,
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: "invite_speaker",
    entityType: "event_speaker",
    entityId: invitation.id,
    metadata: {
      eventId: validated.eventId,
      alumniUserId: validated.alumniUserId,
    },
  });

  return invitation;
};

/**
 * Alumni: Respond to speaker invitation
 */
export const respondSpeakerInvitation = async (
  speakerId: string,
  status: "accepted" | "declined",
  note?: string,
) => {
  // Chỉ alumni (và admin do bypass) mới có thể phản hồi lời mời diễn giả
  const current = await requireRole(["alumni"]);
  const validated = speakerResponseSchema.parse({ status, note });

  const [updated] = await db
    .update(eventSpeakers)
    .set({
      invitationStatus: validated.status,
      respondedAt: new Date(),
      note: validated.note || undefined,
    })
    .where(
      and(
        eq(eventSpeakers.id, speakerId),
        eq(eventSpeakers.alumniUserId, current.user.id),
        eq(eventSpeakers.invitationStatus, "pending"),
      ),
    )
    .returning();

  if (!updated) {
    throw new Error("Lời mời không tồn tại hoặc đã được phản hồi");
  }

  return updated;
};

/**
 * Student/Alumni: Register to attend event
 */
export const registerForEvent = async (eventId: string) => {
  // Người dùng bị khóa không được đăng ký
  const current = await requireRole(["student", "alumni"]);

  // Khóa cùng một hàng sự kiện để các lượt đăng ký đồng thời kiểm tra số chỗ tuần tự.
  return await db.transaction(async (tx) => {
    const [eventItem] = await tx
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .for("update");

    if (!eventItem) throw new Error("Không tìm thấy sự kiện");
    if (eventItem.status !== "published")
      throw new Error("Sự kiện chưa mở đăng ký");
    if (eventItem.endTime <= new Date()) throw new Error("Sự kiện đã kết thúc");

    const existing = await tx.query.eventRegistrations.findFirst({
      where: { eventId, userId: current.user.id },
    });
    if (existing) return existing;

    if (eventItem.capacity !== null) {
      const [registrations] = await tx
        .select({ total: count() })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId));
      if (Number(registrations?.total ?? 0) >= eventItem.capacity) {
        throw new Error("Sự kiện đã đủ số lượng người tham dự");
      }
    }

    const [registration] = await tx
      .insert(eventRegistrations)
      .values({
        eventId,
        userId: current.user.id,
        attendanceStatus: "registered",
      })
      .onConflictDoNothing()
      .returning();

    return registration || { registered: true };
  });
};

/**
 * Faculty/Admin: Mark attendance for an attendee
 */
export const markAttendance = async (
  registrationId: string,
  status: "attended" | "absent" | "registered",
) => {
  await requireRole(["faculty_staff", "admin"]);
  const validatedStatus = attendanceStatusSchema.parse(status);

  const [updated] = await db
    .update(eventRegistrations)
    .set({ attendanceStatus: validatedStatus })
    .where(eq(eventRegistrations.id, registrationId))
    .returning();

  if (!updated) throw new Error("Không tìm thấy lượt đăng ký");

  return updated;
};

/**
 * Student/Alumni: Get my event registrations and speaker invitations
 */
export const getMyEventsAndInvites = async () => {
  const current = await getCurrentUser();
  if (!current?.user) return { registrations: [], speakerInvites: [] };

  const registrations = await db.query.eventRegistrations.findMany({
    where: {
      userId: current.user.id,
    },
    with: {
      event: {
        with: {
          speakers: {
            where: { invitationStatus: "accepted" },
            with: {
              alumni: {
                columns: PUBLIC_USER_COLUMNS,
                with: { profile: { columns: PUBLIC_PROFILE_COLUMNS } },
              },
            },
          },
        },
      },
    },
    orderBy: {
      registeredAt: "desc",
    },
  });

  const speakerInvites = await db.query.eventSpeakers.findMany({
    where: {
      alumniUserId: current.user.id,
    },
    with: {
      event: true,
    },
    orderBy: {
      invitedAt: "desc",
    },
  });

  return { registrations, speakerInvites };
};

/**
 * Faculty/Admin: Get all alumni profiles eligible for speaker invitation
 */
export const getAlumniForSpeakerInvitation = async () => {
  await requireRole(["faculty_staff", "admin"]);

  return await db.query.profiles.findMany({
    where: {
      role: "alumni", // hoặc { role: { eq: "alumni" } }
    },
    with: {
      user: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });
};

export type AlumniSpeakerCandidate = Awaited<
  ReturnType<typeof getAlumniForSpeakerInvitation>
>[number];
