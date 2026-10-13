/** Only application paths may be used for redirects and notification links. */
export const getInternalHref = (value: unknown): string | null => {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    Array.from(value).some((char) => char === "\\" || char.charCodeAt(0) <= 32)
  ) {
    return null;
  }
  return value;
};
