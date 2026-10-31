import { InvalidStateError } from "@/lib/errors";

export type EntityType =
  | "job"
  | "company"
  | "experience"
  | "scholarship_application"
  | "hero_slide"
  | "event_album"
  | "album_photo"
  | "photo_takedown_request";

export const ALLOWED_TRANSITIONS: Record<EntityType, Record<string, string[]>> = {
  job: {
    pending: ["approved", "rejected"],
    approved: ["expired", "closed"],
    rejected: ["pending"], // Resubmitted by employer
    closed: [],
    expired: [],
  },
  company: {
    pending: ["verified", "rejected"],
    verified: ["rejected"], // Admin revoking verification
    rejected: ["pending"],  // Resubmit
  },
  experience: {
    draft: ["pending"],
    pending: ["published", "rejected"],
    published: ["rejected"],
    rejected: ["pending", "draft"],
  },
  scholarship_application: {
    pending: ["reviewing", "rejected"],
    reviewing: ["approved", "rejected"],
    approved: [], // Cannot alter without admin override
    rejected: [],
  },
  hero_slide: {
    draft: ["published"],
    published: ["draft"],
  },
  event_album: {
    draft: ["published", "archived"],
    published: ["archived"],
    archived: ["published"],
  },
  album_photo: {
    published: ["removed"],
    removed: ["published"],
  },
  photo_takedown_request: {
    open: ["accepted", "rejected"],
    accepted: [],
    rejected: [],
  },
};

export function canTransition(
  entity: EntityType,
  fromStatus: string,
  toStatus: string,
): boolean {
  return ALLOWED_TRANSITIONS[entity]?.[fromStatus]?.includes(toStatus) ?? false;
}

/**
 * Validates whether transition from `fromStatus` to `toStatus` is permissible for `entity`.
 * Throws `InvalidStateError` if the transition is prohibited.
 */
export function validateStateTransition(
  entity: EntityType,
  fromStatus: string,
  toStatus: string,
  isAdmin = false
): void {
  // Admin may override application status reversal with audit
  if (isAdmin && entity === "scholarship_application" && (fromStatus === "approved" || fromStatus === "rejected")) {
    return;
  }

  // Restoring removed photo requires admin privileges
  if (!isAdmin && entity === "album_photo" && fromStatus === "removed" && toStatus === "published") {
    throw new InvalidStateError("Chỉ quản trị viên mới có quyền khôi phục ảnh đã bị gỡ.");
  }

  const allowedNext = ALLOWED_TRANSITIONS[entity]?.[fromStatus] ?? [];
  if (!allowedNext.includes(toStatus)) {
    throw new InvalidStateError(
      `Không thể chuyển trạng thái ${entity} từ '${fromStatus}' sang '${toStatus}'. Các trạng thái hợp lệ tiếp theo: [${allowedNext.join(", ")}]`
    );
  }
}
