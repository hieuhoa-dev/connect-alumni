import { describe, expect, it, vi } from "vitest";
import {
  getUploadPolicy,
  UPLOAD_POLICIES,
} from "@/lib/upload-policy";
import { verifyUploadedFile } from "@/server/services/upload-verification";

describe("Upload Policy Configuration", () => {
  it("should define strict security policies for all supported purposes", () => {
    expect(getUploadPolicy("avatar")).not.toBeNull();
    expect(getUploadPolicy("company_logo")).not.toBeNull();
    expect(getUploadPolicy("event_cover")).not.toBeNull();
    expect(getUploadPolicy("hero_banner")).not.toBeNull();
    expect(getUploadPolicy("album_photo")).not.toBeNull();
    expect(getUploadPolicy("proof_document")).not.toBeNull();
    expect(getUploadPolicy("cv")).not.toBeNull();
  });

  it("should strictly disallow SVG uploads to prevent Stored XSS", () => {
    for (const [, policy] of Object.entries(UPLOAD_POLICIES)) {
      expect(policy.allowedMimeTypes).not.toContain("image/svg+xml");
    }
  });

  it("should mark sensitive user documents as private visibility", () => {
    expect(UPLOAD_POLICIES.proof_document.visibility).toBe("private");
    expect(UPLOAD_POLICIES.cv.visibility).toBe("private");
  });

  it("should return null for undefined or malicious upload purposes", () => {
    expect(getUploadPolicy("malicious_exe")).toBeNull();
    expect(getUploadPolicy("")).toBeNull();
  });
});

describe("verifyUploadedFile Security Check", () => {
  it("should reject when file does not exist, belongs to another user, or has mismatched purpose", async () => {
    // Mock db call
    vi.mock("@/db", () => ({
      db: {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: async () => [],
            }),
          }),
        }),
      },
    }));

    const result = await verifyUploadedFile("fake-uuid", "user-123", "avatar");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("không thuộc quyền sở hữu, sai mục đích");
  });
});
