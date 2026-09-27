import { z } from "zod";

export const companyCreateSchema = z.object({
  name: z.string().min(2, "Tên doanh nghiệp ít nhất 2 ký tự"),
  description: z.string().min(10, "Mô tả doanh nghiệp ít nhất 10 ký tự"),
  industry: z.string().min(2, "Lĩnh vực hoạt động không được để trống"),
  website: z
    .string()
    .url("Địa chỉ website không hợp lệ")
    .optional()
    .or(z.literal("")),
  logoUrl: z.string().optional().nullable(),
  roleInCompany: z
    .string()
    .min(2, "Chức vụ của bạn trong công ty (ví dụ: HR Lead, Recruiter)"),
});

export const companyReviewSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  rejectedReason: z.string().optional().nullable(),
});

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyReviewInput = z.infer<typeof companyReviewSchema>;
