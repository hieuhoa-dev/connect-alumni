import { z } from "zod";

export const campaignCreateSchema = z.object({
  title: z.string().min(5, "Tên chiến dịch ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả chiến dịch ít nhất 10 ký tự"),
  targetAmount: z.coerce
    .number()
    .positive("Mục tiêu gây quỹ phải lớn hơn 0")
    .max(999_999_999_999.99, "Mục tiêu gây quỹ vượt giới hạn cho phép")
    .multipleOf(0.01, "Số tiền chỉ được có tối đa hai chữ số thập phân"),
  applicationDeadline: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine(
      (date) => !Number.isNaN(date.getTime()),
      "Hạn nộp hồ sơ không hợp lệ",
    ),
  applicationFormId: z
    .string()
    .uuid("Form ứng tuyển không hợp lệ")
    .optional()
    .nullable(),
  status: z.enum(["draft", "open", "closed"]).default("open"),
});

export const donationPledgeSchema = z.object({
  campaignId: z.string().uuid("ID chiến dịch không hợp lệ"),
  donorDisplayName: z
    .string()
    .min(2, "Vui lòng nhập họ tên hoặc tên tổ chức tài trợ"),
  isAnonymous: z.boolean().default(false),
  amount: z.coerce
    .number()
    .positive("Số tiền cam kết tài trợ phải lớn hơn 0")
    .max(999_999_999_999.99, "Số tiền cam kết vượt giới hạn cho phép")
    .multipleOf(0.01, "Số tiền chỉ được có tối đa hai chữ số thập phân"),
  note: z.string().optional().nullable(),
});

export const scholarshipApplicationReviewSchema = z.object({
  status: z.enum(["reviewing", "approved", "rejected"]),
  score: z.coerce.number().min(0).max(100).optional().nullable(),
  reviewNote: z.string().optional().nullable(),
});

export const scholarshipApplicationSchema = z.object({
  campaignId: z.string().uuid("ID chiến dịch không hợp lệ"),
  formResponseId: z.string().uuid("Phản hồi biểu mẫu không hợp lệ").optional(),
});

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type DonationPledgeInput = z.infer<typeof donationPledgeSchema>;
export type ScholarshipApplicationReviewInput = z.infer<
  typeof scholarshipApplicationReviewSchema
>;
