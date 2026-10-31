import { describe, expect, it } from "vitest";
import { isSafeHref } from "@/lib/safe-url";

describe("isSafeHref Security Validation", () => {
  it("should accept valid internal relative paths", () => {
    expect(isSafeHref("/")).toBe(true);
    expect(isSafeHref("/events")).toBe(true);
    expect(isSafeHref("/gallery/abc-123")).toBe(true);
    expect(isSafeHref("/jobs?type=full_time")).toBe(true);
    expect(isSafeHref("/about#team")).toBe(true);
  });

  it("should accept valid HTTPS external URLs", () => {
    expect(isSafeHref("https://dlu.edu.vn")).toBe(true);
    expect(isSafeHref("https://khoacntt.dlu.edu.vn/tintuc")).toBe(true);
    expect(isSafeHref("https://google.com")).toBe(true);
  });

  it("should strictly reject protocol-relative URLs (open redirect vector)", () => {
    expect(isSafeHref("//evil.com")).toBe(false);
    expect(isSafeHref("///evil.com")).toBe(false);
  });

  it("should strictly reject insecure HTTP URLs", () => {
    expect(isSafeHref("http://dlu.edu.vn")).toBe(false);
    expect(isSafeHref("http://insecure-site.com")).toBe(false);
  });

  it("should strictly reject dangerous protocols (XSS vectors)", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("javascript:void(0)")).toBe(false);
    expect(isSafeHref("JAVASCRIPT:alert('xss')")).toBe(false);
    expect(isSafeHref("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeHref("vbscript:msgbox(1)")).toBe(false);
    expect(isSafeHref("file:///etc/passwd")).toBe(false);
  });

  it("should reject empty, whitespace, or invalid inputs", () => {
    expect(isSafeHref("")).toBe(false);
    expect(isSafeHref("   ")).toBe(false);
    expect(isSafeHref(null as any)).toBe(false);
    expect(isSafeHref(undefined as any)).toBe(false);
  });
});
