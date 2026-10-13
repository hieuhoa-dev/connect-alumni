import { z } from "zod";

export const companyCreateSchema = z.object({
  name: z.string().trim().min(2, "Tên doanh nghiệp ít nhất 2 ký tự"),
  description: z.string().trim().min(10, "Mô tả doanh nghiệp ít nhất 10 ký tự"),
  industry: z.string().trim().min(2, "Lĩnh vực hoạt động không được để trống"),
  website: z
    .string()
    .trim()
    .url("Địa chỉ website không hợp lệ")
    .refine(
      (v) => /^https?:\/\//i.test(v),
      "Website phải bắt đầu bằng http:// hoặc https://",
    )
    .optional()
    .or(z.literal("")),
  logoUrl: z.string().trim().optional().nullable(),
  roleInCompany: z
    .string()
    .trim()
    .min(2, "Chức vụ của bạn trong công ty (ví dụ: HR Lead, Recruiter)"),
});

export const companyReviewSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  rejectedReason: z.string().trim().optional().nullable(),
});

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyReviewInput = z.infer<typeof companyReviewSchema>;
