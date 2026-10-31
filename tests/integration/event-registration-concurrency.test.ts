import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventService } from "@/server/services/event-service";

const mockGetCurrentUser = vi.fn();

vi.mock("@/lib/permissions", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/db", () => ({
  db: {
    transaction: async (cb: any) => {
      const fakeTx = {
        execute: async () => ({
          rows: [
            {
              id: "ev-123",
              title: "Workshop AI",
              status: "published",
              capacity: 50,
              start_time: new Date(Date.now() + 86400000),
              end_time: new Date(Date.now() + 172800000),
            },
          ],
        }),
        select: () => ({
          from: () => ({
            where: () =>
              Object.assign(Promise.resolve([{ count: 50 }]), {
                limit: () => Promise.resolve([]),
              }),
          }),
        }),
      };
      return cb(fakeTx);
    },
  },
}));

describe("Event Registration Concurrency & Capacity Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail gracefully when user is not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const service = new EventService();
    const result = await service.registerForEvent("ev-123");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("UNAUTHORIZED");
    }
  });

  it("should block registration when student profile is missing", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({
      user: { id: "user-1" },
      profile: null,
    });

    const service = new EventService();
    const result = await service.registerForEvent("ev-123");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("PROFILE_REQUIRED");
    }
  });

  it("should enforce capacity constraint when event is full under lock", async () => {
    mockGetCurrentUser.mockResolvedValueOnce({
      user: { id: "user-1" },
      profile: {
        id: "p-1",
        status: "active",
        role: "student",
      },
    });

    const service = new EventService();
    const result = await service.registerForEvent("ev-123");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("CONFLICT");
      expect(result.error).toContain("đã đủ số lượng");
    }
  });
});
