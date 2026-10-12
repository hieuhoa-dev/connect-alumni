import { z } from "zod";

const entityIdSchema = z.uuid();

export const isEntityId = (value: unknown): value is string =>
  entityIdSchema.safeParse(value).success;

export const getPagination = (
  params?: { limit?: number; offset?: number },
  defaultLimit = 20,
  maxLimit = 50,
) => ({
  limit: Number.isFinite(params?.limit)
    ? Math.min(Math.max(Math.trunc(params?.limit ?? defaultLimit), 1), maxLimit)
    : defaultLimit,
  offset: Number.isFinite(params?.offset)
    ? Math.min(
        Math.max(Math.trunc(params?.offset ?? 0), 0),
        Number.MAX_SAFE_INTEGER,
      )
    : 0,
});
