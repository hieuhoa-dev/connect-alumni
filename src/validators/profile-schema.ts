import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự").max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  avatarUrl: z.string().max(1000).optional().nullable(),
  avatarFileId: z.string().uuid().optional().nullable(),
  studentCode: z.string().max(20).optional().nullable(),
  faculty: z.string().max(100).optional().nullable(),
  major: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  batchYear: z.number().int().min(1976).max(2035).optional().nullable(),
  graduationYear: z.number().int().min(1980).max(2040).optional().nullable(),
  employmentStatus: z
    .enum(["employed", "self_employed", "seeking", "studying", "other"])
    .optional()
    .nullable(),
  currentTitle: z.string().max(100).optional().nullable(),
  currentCompanyName: z.string().max(200).optional().nullable(),
  currentCompanyId: z.string().uuid().optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  linkedinUrl: z
    .string()
    .url("Liên kết LinkedIn không hợp lệ")
    .optional()
    .nullable()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .url("Liên kết GitHub không hợp lệ")
    .optional()
    .nullable()
    .or(z.literal("")),
  websiteUrl: z
    .string()
    .url("Liên kết trang web không hợp lệ")
    .optional()
    .nullable()
    .or(z.literal("")),
  skills: z.array(z.string().max(30)).max(20).optional(),
  visibility: z.enum(["public", "members", "private"]).optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
});

export const workExperienceSchema = z
  .object({
    id: z.string().uuid().optional(),
    companyName: z.string().min(1, "Vui lòng nhập tên công ty").max(200),
    companyId: z.string().uuid().optional().nullable(),
    title: z.string().min(1, "Vui lòng nhập chức danh").max(100),
    industry: z.string().max(100).optional().nullable(),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()).optional().nullable(),
    isCurrent: z.boolean().default(false),
    description: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.isCurrent && !data.endDate) {
        return false;
      }
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
      path: ["endDate"],
    },
  );

export const alumniVerifySchema = z.object({
  targetUserId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  reason: z.string().min(5, "Lý do từ chối tối thiểu 5 ký tự").optional(),
});

export const alumniSearchFilterSchema = z.object({
  search: z.string().optional(),
  batchYear: z.coerce.number().optional(),
  major: z.string().optional(),
  province: z.string().optional(),
  industry: z.string().optional(),
  employmentStatus: z
    .enum(["employed", "self_employed", "seeking", "studying", "other"])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;
export type AlumniSearchFilterInput = z.infer<typeof alumniSearchFilterSchema>;
