import { describe, expect, it } from "vitest";
import { isValidDluEmail } from "@/lib/dlu-email";

describe("isValidDluEmail Server-Side Domain Restriction", () => {
  it("should accept valid student and faculty Dalat University emails", () => {
    expect(isValidDluEmail("sv2011234@dlu.edu.vn")).toBe(true);
    expect(isValidDluEmail("gv.cntt@dlu.edu.vn")).toBe(true);
    expect(isValidDluEmail("admin.cntt@dlu.edu.vn")).toBe(true);
    expect(isValidDluEmail("trankhanh.20@dlu.edu.vn")).toBe(true);
    expect(isValidDluEmail("  User@DLU.EDU.VN  ")).toBe(true);
  });

  it("should strictly reject subdomains of dlu.edu.vn", () => {
    expect(isValidDluEmail("user@mail.dlu.edu.vn")).toBe(false);
    expect(isValidDluEmail("user@it.dlu.edu.vn")).toBe(false);
    expect(isValidDluEmail("student@cntt.dlu.edu.vn")).toBe(false);
  });

  it("should strictly reject spoofed or phishing domains", () => {
    expect(isValidDluEmail("user@dlu.edu.vn.attacker.com")).toBe(false);
    expect(isValidDluEmail("user@fake-dlu.edu.vn")).toBe(false);
    expect(isValidDluEmail("user@dlu.edu.vn.co")).toBe(false);
    expect(isValidDluEmail("user@dlu-edu.vn")).toBe(false);
  });

  it("should strictly reject public and commercial email providers", () => {
    expect(isValidDluEmail("user@gmail.com")).toBe(false);
    expect(isValidDluEmail("student@yahoo.com")).toBe(false);
    expect(isValidDluEmail("alumni@outlook.com")).toBe(false);
    expect(isValidDluEmail("admin@hotmail.com")).toBe(false);
  });

  it("should reject malformed and empty email addresses", () => {
    expect(isValidDluEmail("")).toBe(false);
    expect(isValidDluEmail("not-an-email")).toBe(false);
    expect(isValidDluEmail("user@")).toBe(false);
    expect(isValidDluEmail("@dlu.edu.vn")).toBe(false);
    expect(isValidDluEmail("user@@dlu.edu.vn")).toBe(false);
    expect(isValidDluEmail(null)).toBe(false);
    expect(isValidDluEmail(undefined)).toBe(false);
  });
});
