"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { events, eventSpeakers, eventRegistrations, profiles } from "@/db/schema";
import { requireRole, getCurrentUser } from "@/lib/permissions";
import {
  eventCreateSchema,
  speakerInviteSchema,
  EventCreateInput,
  SpeakerInviteInput,
} from "@/validators/event-schema";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";

/**
 * Public: Get published events
 */
export const getPublishedEvents = async () => {
  return await db.query.events.findMany({
    where: {
      status: "published",
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
      registrations: true,
    },
    orderBy: {
      startTime: "desc",
    },
  });
};

/**
 * Get event details by ID
 */
export const getEventById = async (id: string) => {
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
      description: validated.description,
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

  const [invitation] = await db
    .insert(eventSpeakers)
    .values({
      eventId: validated.eventId,
      alumniUserId: validated.alumniUserId,
      note: validated.note || null,
      invitationStatus: "pending",
    })
    .returning();

  const eventItem = await db.query.events.findFirst({
    where: {
      id: validated.eventId,
    },
  });

  // Notify Alumni
  await sendNotification({
    userId: validated.alumniUserId,
    type: "speaker_invitation",
    title: `Lời mời diễn giả: "${eventItem?.title || 'Sự kiện Khoa'}"`,
    body: `Khoa trân trọng kính mời bạn tham gia làm diễn giả/khách mời sự kiện. Lời nhắn: ${validated.note || 'Không có ghi chú'}.`,
    linkUrl: `/student/events`,
    sendEmail: true,
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: "invite_speaker",
    entityType: "event_speaker",
    entityId: invitation.id,
    metadata: { eventId: validated.eventId, alumniUserId: validated.alumniUserId },
  });

  return invitation;
};

/**
 * Alumni: Respond to speaker invitation
 */
export const respondSpeakerInvitation = async (speakerId: string, status: "accepted" | "declined", note?: string) => {
  const current = await getCurrentUser();
  if (!current?.user) throw new Error("Chưa đăng nhập");

  const [updated] = await db
    .update(eventSpeakers)
    .set({
      invitationStatus: status,
      respondedAt: new Date(),
      note: note || undefined,
    })
    .where(
      and(
        eq(eventSpeakers.id, speakerId),
        eq(eventSpeakers.alumniUserId, current.user.id),
      ),
    )
    .returning();

  return updated;
};

/**
 * Student/Alumni: Register to attend event
 */
export const registerForEvent = async (eventId: string) => {
  const current = await getCurrentUser();
  if (!current?.user) {
    throw new Error("Vui lòng đăng nhập để đăng ký tham gia sự kiện");
  }

  // Check capacity if set
  const eventItem = await db.query.events.findFirst({
    where: {
      id: eventId,
    },
    with: { registrations: true },
  });

  if (!eventItem) throw new Error("Không tìm thấy sự kiện");
  if (eventItem.status !== "published") throw new Error("Sự kiện chưa mở đăng ký");

  if (eventItem.capacity && eventItem.registrations.length >= eventItem.capacity) {
    throw new Error("Sự kiện đã đủ số lượng người tham dự");
  }

  const [reg] = await db
    .insert(eventRegistrations)
    .values({
      eventId,
      userId: current.user.id,
      attendanceStatus: "registered",
    })
    .onConflictDoNothing()
    .returning();

  return reg || { registered: true };
};

/**
 * Faculty/Admin: Mark attendance for an attendee
 */
export const markAttendance = async (
  registrationId: string,
  status: "attended" | "absent" | "registered",
  ) => {
  await requireRole(["faculty_staff", "admin"]);

  const [updated] = await db
    .update(eventRegistrations)
    .set({ attendanceStatus: status })
    .where(eq(eventRegistrations.id, registrationId))
    .returning();

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
            with: {
              alumni: {
                with: { profile: true },
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
    where: (profiles, { eq }) => eq(profiles.role, "alumni"),
    with: {
      user: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });
};

export type AlumniSpeakerCandidate = Awaited<ReturnType<typeof getAlumniForSpeakerInvitation>>[number];
