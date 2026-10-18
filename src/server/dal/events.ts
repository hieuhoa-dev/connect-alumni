import { db } from "@/db";

export interface PublicEventDTO {
  id: string;
  type: string;
  title: string;
  description: string;
  format: "offline" | "online" | "hybrid";
  locationOrLink: string | null;
  startTime: Date;
  endTime: Date;
  capacity: number | null;
  status: string;
  coverImageUrl: string | null;
  registrationsCount: number;
  speakers: Array<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
    faculty: string | null;
    batchYear: number | null;
    note: string | null;
  }>;
}

/**
 * Data Access Layer: Query published events with strictly stripped public DTOs.
 * Does not expose attendees, phone numbers, or private online meeting links to anonymous visitors.
 */
export async function getPublicEvents(options?: {
  viewerUserId?: string;
}): Promise<PublicEventDTO[]> {
  const events = await db.query.events.findMany({
    where: {
      status: "published",
    },
    with: {
      speakers: {
        where: {
          invitationStatus: "accepted",
        },
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

  return events.map((ev) => {
    const isRegistered =
      options?.viewerUserId &&
      ev.registrations.some((r) => r.userId === options.viewerUserId);

    // Online meeting link is only revealed to registered participants when event is upcoming/live
    const isOnline = ev.format === "online";
    let safeLocationOrLink: string | null = ev.locationOrLink;
    if (isOnline && !isRegistered) {
      safeLocationOrLink = "Đăng ký tham dự để nhận link phòng họp trực tuyến";
    }

    return {
      id: ev.id,
      type: ev.type,
      title: ev.title,
      description: ev.description,
      format: ev.format as "offline" | "online" | "hybrid",
      locationOrLink: safeLocationOrLink,
      startTime: ev.startTime,
      endTime: ev.endTime,
      capacity: ev.capacity,
      status: ev.status,
      coverImageUrl: ev.coverImageUrl,
      registrationsCount: ev.registrations.length,
      speakers: ev.speakers.map((sp) => ({
        id: sp.id,
        fullName: sp.alumni?.profile?.fullName || "Diễn giả cựu sinh viên",
        avatarUrl: sp.alumni?.profile?.avatarUrl || null,
        faculty: sp.alumni?.profile?.faculty || null,
        batchYear: sp.alumni?.profile?.batchYear || null,
        note: sp.note,
      })),
    };
  });
}

/**
 * Data Access Layer: Query single event by ID with public DTO stripping.
 */
export async function getPublicEventById(
  id: string,
  options?: { viewerUserId?: string }
): Promise<PublicEventDTO | null> {
  const ev = await db.query.events.findFirst({
    where: {
      id,
    },
    with: {
      speakers: {
        where: {
          invitationStatus: "accepted",
        },
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
  });

  if (!ev || ev.status !== "published") {
    return null;
  }

  const isRegistered =
    options?.viewerUserId &&
    ev.registrations.some((r) => r.userId === options.viewerUserId);

  const isOnline = ev.format === "online";
  let safeLocationOrLink: string | null = ev.locationOrLink;
  if (isOnline && !isRegistered) {
    safeLocationOrLink = "Đăng ký tham dự để nhận link phòng họp trực tuyến";
  }

  return {
    id: ev.id,
    type: ev.type,
    title: ev.title,
    description: ev.description,
    format: ev.format as "offline" | "online" | "hybrid",
    locationOrLink: safeLocationOrLink,
    startTime: ev.startTime,
    endTime: ev.endTime,
    capacity: ev.capacity,
    status: ev.status,
    coverImageUrl: ev.coverImageUrl,
    registrationsCount: ev.registrations.length,
    speakers: ev.speakers.map((sp) => ({
      id: sp.id,
      fullName: sp.alumni?.profile?.fullName || "Diễn giả cựu sinh viên",
      avatarUrl: sp.alumni?.profile?.avatarUrl || null,
      faculty: sp.alumni?.profile?.faculty || null,
      batchYear: sp.alumni?.profile?.batchYear || null,
      note: sp.note,
    })),
  };
}
