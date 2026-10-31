/**
 * Validates that an href is safe to use in links:
 * - Internal paths starting with '/' (but not protocol-relative '//')
 * - Full URLs starting with 'https://'
 * Rejects 'http://', 'javascript:', 'data:', 'vbscript:', etc.
 */
export function isSafeHref(href: string | null | undefined): boolean {
  if (!href || typeof href !== "string") {
    return false;
  }

  const trimmed = href.trim();

  // Internal path
  if (trimmed.startsWith("/")) {
    // Disallow protocol-relative URLs like '//evil.com'
    return !trimmed.startsWith("//");
  }

  // Absolute HTTPS URL
  if (trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "https:";
    } catch (_e) {
      return false;
    }
  }

  return false;
}
