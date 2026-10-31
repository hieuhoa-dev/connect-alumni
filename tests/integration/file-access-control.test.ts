import { describe, expect, it } from "vitest";

const ALLOWED_PUBLIC_PREFIXES = [
  "uploads/avatar/",
  "uploads/company_logo/",
  "uploads/event_cover/",
  "uploads/experience_cover/",
  "uploads/hero_banner/",
  "uploads/album_photo/",
];

function isPublicFile(key: string): boolean {
  if (key.includes("..") || key.includes("//")) return false;
  return ALLOWED_PUBLIC_PREFIXES.some((prefix) => key.startsWith(prefix));
}

describe("Private File Access Control & Public Prefix Restriction", () => {
  it("should permit public media file keys", () => {
    expect(isPublicFile("uploads/avatar/user1-thumb.webp")).toBe(true);
    expect(isPublicFile("uploads/company_logo/vng.png")).toBe(true);
    expect(isPublicFile("uploads/event_cover/talkshow.jpg")).toBe(true);
    expect(isPublicFile("uploads/album_photo/graduation-1.webp")).toBe(true);
    expect(isPublicFile("uploads/hero_banner/banner1.webp")).toBe(true);
  });

  it("should strictly deny access to private documents (CV, proof documents)", () => {
    expect(isPublicFile("uploads/proof_document/transcript_2026.pdf")).toBe(
      false,
    );
    expect(isPublicFile("uploads/cv/resume_john_doe.pdf")).toBe(false);
    expect(isPublicFile("uploads/private/financial_statement.pdf")).toBe(false);
    expect(isPublicFile("etc/passwd")).toBe(false);
    expect(isPublicFile("config.env")).toBe(false);
  });

  it("should reject path traversal attempts", () => {
    expect(isPublicFile("uploads/avatar/../../proof_document/secret.pdf")).toBe(
      false,
    );
    expect(isPublicFile("../../../etc/shadow")).toBe(false);
  });
});
