import sanitizeHtml from "sanitize-html";

/**
 * Lọc HTML do người dùng nhập (nội dung TipTap) trước khi lưu hoặc hiển thị.
 * Chỉ giữ các thẻ định dạng cơ bản, bỏ mọi thuộc tính sự kiện (onerror, onclick...),
 * <script>, <iframe>, và các liên kết không phải http/https/mailto.
 *
 * Chỉ import từ code chạy trên server (Server Component, Server Action).
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "hr",
    "a",
  ],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    }),
  },
};

export const sanitizeRichHtml = (html: string): string =>
  sanitizeHtml(html, OPTIONS);
