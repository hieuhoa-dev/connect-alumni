/**
 * Strictly verifies whether an email belongs to Dalat University (@dlu.edu.vn).
 * Rejects subdomains (e.g. @it.dlu.edu.vn), phishing domains (e.g. @dlu.edu.vn.evil.com),
 * and public providers (e.g. @gmail.com).
 */
export function isValidDluEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  const parts = normalized.split("@");
  if (parts.length !== 2) return false;
  if (!parts[0] || parts[0].length === 0) return false;
  return parts[1] === "dlu.edu.vn";
}
