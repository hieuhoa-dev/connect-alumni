import { InvalidStateError } from "@/lib/errors";

export type EntityType = "job" | "company" | "experience" | "scholarship_application";

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
};

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

  const allowedNext = ALLOWED_TRANSITIONS[entity]?.[fromStatus] ?? [];
  if (!allowedNext.includes(toStatus)) {
    throw new InvalidStateError(
      `Không thể chuyển trạng thái ${entity} từ '${fromStatus}' sang '${toStatus}'. Các trạng thái hợp lệ tiếp theo: [${allowedNext.join(", ")}]`
    );
  }
}
