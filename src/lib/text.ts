/**
 * Tiện ích định dạng văn bản / ngày / tiền tệ dùng chung cho các trang công khai.
 * Mọi chuỗi trả về đều là văn bản thuần — React sẽ tự escape khi render.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

/** Bỏ thẻ HTML (nội dung TipTap) và gom khoảng trắng, chỉ giữ văn bản thuần. */
export const stripHtml = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<\/(p|div|h[1-6]|li|blockquote|pre)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(
      /&(nbsp|amp|lt|gt|quot|apos|#39);/gi,
      (m) => HTML_ENTITIES[m.toLowerCase()] ?? m,
    )
    .replace(/\s+/g, " ")
    .trim();
};

/** Tạo đoạn trích ngắn từ nội dung (HTML hoặc văn bản thường). */
export const makeExcerpt = (content: string, maxLength = 180): string => {
  const text = stripHtml(content);
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > maxLength * 0.6 ? lastSpace : maxLength)}…`;
};

const VN_TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * Định dạng ngày theo múi giờ Việt Nam.
 * Cố định timeZone để kết quả không phụ thuộc múi giờ của máy chủ (Vercel chạy UTC).
 */
export const formatDateVi = (
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  },
): string =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: VN_TIME_ZONE,
    ...options,
  }).format(new Date(value));

export const formatTimeVi = (value: Date | string | number): string =>
  formatDateVi(value, { hour: "2-digit", minute: "2-digit", hour12: false });

export const formatNumberVi = (value: number): string =>
  new Intl.NumberFormat("vi-VN").format(value);

/** 1.250.000.000 -> "1,25 tỷ"; 350.000.000 -> "350 triệu". */
export const formatVndCompact = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return "0 đ";
  const trim = (n: number) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(n);
  if (value >= 1_000_000_000) return `${trim(value / 1_000_000_000)} tỷ`;
  if (value >= 1_000_000) return `${trim(value / 1_000_000)} triệu`;
  return `${formatNumberVi(value)} đ`;
};

/** Chữ cái đầu của họ và tên (từ đầu + từ cuối), giống ký hiệu ở thanh bên. */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "CA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const JOB_TYPE_LABEL: Record<string, string> = {
  full_time: "Toàn thời gian",
  part_time: "Bán thời gian",
  internship: "Thực tập",
};

export const EVENT_TYPE_LABEL: Record<string, string> = {
  talkshow: "Talkshow",
  workshop: "Workshop",
  job_fair: "Ngày hội việc làm",
  other: "Sự kiện",
};

export const NEWS_CATEGORIES = [
  "announcement",
  "connect",
  "share",
  "cooperation",
  "success",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  announcement: "Thông báo",
  connect: "Kết nối",
  share: "Chia sẻ",
  cooperation: "Hợp tác",
  success: "Thành công",
};

export const isNewsCategory = (value: unknown): value is NewsCategory =>
  typeof value === "string" &&
  (NEWS_CATEGORIES as readonly string[]).includes(value);

export const ROLE_LABEL: Record<string, string> = {
  student: "Sinh viên",
  alumni: "Cựu sinh viên",
  employer: "Doanh nghiệp",
  faculty_staff: "Cán bộ Khoa",
  admin: "Quản trị viên",
};

/** Thời gian tương đối ngắn gọn: "vừa xong", "5 phút trước", "3 giờ trước", "2 ngày trước". */
export const formatRelativeVi = (value: Date | string | number): string => {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatDateVi(value);
};
