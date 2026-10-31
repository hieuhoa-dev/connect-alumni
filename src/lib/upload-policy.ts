export type UploadPurpose =
  | "avatar"
  | "company_logo"
  | "event_cover"
  | "experience_cover"
  | "hero_banner"
  | "album_photo"
  | "proof_document"
  | "cv";

export type UploadVisibility = "public" | "private";

export interface PurposePolicy {
  purpose: UploadPurpose;
  visibility: UploadVisibility;
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  allowedRoles?: string[]; // If undefined, any authenticated user
  dailyQuota: number;
  description: string;
}

export const UPLOAD_POLICIES: Record<UploadPurpose, PurposePolicy> = {
  avatar: {
    purpose: "avatar",
    visibility: "public",
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    dailyQuota: 20,
    description: "Ảnh đại diện cá nhân (tối đa 2MB, định dạng JPG/PNG/WebP)",
  },
  company_logo: {
    purpose: "company_logo",
    visibility: "public",
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedRoles: ["employer", "faculty_staff", "admin"],
    dailyQuota: 20,
    description: "Logo doanh nghiệp (tối đa 2MB, định dạng JPG/PNG/WebP, không chấp nhận SVG)",
  },
  event_cover: {
    purpose: "event_cover",
    visibility: "public",
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedRoles: ["faculty_staff", "admin"],
    dailyQuota: 30,
    description: "Ảnh bìa sự kiện (tối đa 5MB, tỉ lệ 16:9 gợi ý)",
  },
  experience_cover: {
    purpose: "experience_cover",
    visibility: "public",
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedRoles: ["student", "alumni", "faculty_staff", "admin"],
    dailyQuota: 20,
    description: "Ảnh bìa bài viết chia sẻ (tối đa 5MB)",
  },
  hero_banner: {
    purpose: "hero_banner",
    visibility: "public",
    maxSizeBytes: 8 * 1024 * 1024, // 8MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedRoles: ["faculty_staff", "admin"],
    dailyQuota: 30,
    description: "Banner trang chủ (tối đa 8MB, gợi ý desktop 2100×900, mobile 1080×1350)",
  },
  album_photo: {
    purpose: "album_photo",
    visibility: "public",
    maxSizeBytes: 8 * 1024 * 1024, // 8MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedRoles: ["faculty_staff", "admin"],
    dailyQuota: 100,
    description: "Ảnh thư viện sự kiện (tối đa 8MB)",
  },
  proof_document: {
    purpose: "proof_document",
    visibility: "private",
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    allowedRoles: ["student", "alumni", "faculty_staff", "admin"],
    dailyQuota: 20,
    description: "Tài liệu minh chứng học bổng (PDF hoặc ảnh JPG/PNG, tối đa 10MB)",
  },
  cv: {
    purpose: "cv",
    visibility: "private",
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    allowedRoles: ["student", "alumni"],
    dailyQuota: 20,
    description: "Hồ sơ CV ứng tuyển (tối đa 10MB, ưu tiên PDF)",
  },
};

export const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function getUploadPolicy(purpose: string): PurposePolicy | null {
  return (UPLOAD_POLICIES as Record<string, PurposePolicy>)[purpose] || null;
}

