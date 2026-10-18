import { z } from "zod";

export const campaignCreateSchema = z.object({
  title: z.string().min(5, "Tên chiến dịch ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả chiến dịch ít nhất 10 ký tự"),
  targetAmount: z.coerce.number().positive("Mục tiêu gây quỹ phải lớn hơn 0"),
  applicationDeadline: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  applicationFormId: z
    .string()
    .uuid("Form ứng tuyển không hợp lệ")
    .optional()
    .nullable(),
  status: z.enum(["draft", "open", "closed"]).default("open"),
});

export const pledgeDonationSchema = z.object({
  campaignId: z.string().uuid("ID chiến dịch không hợp lệ"),
  amount: z.coerce
    .number()
    .positive("Số tiền cam kết tài trợ phải lớn hơn 0")
    .max(10_000_000_000, "Số tiền tài trợ tối đa 10 tỷ đồng"),
  isAnonymous: z.boolean().default(false),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional().nullable(),
});

export const recordDonationOnBehalfSchema = z.object({
  campaignId: z.string().uuid("ID chiến dịch không hợp lệ"),
  donorDisplayName: z
    .string()
    .min(2, "Vui lòng nhập họ tên hoặc tên tổ chức tài trợ")
    .max(100, "Tên nhà tài trợ tối đa 100 ký tự"),
  amount: z.coerce
    .number()
    .positive("Số tiền cam kết tài trợ phải lớn hơn 0")
    .max(10_000_000_000, "Số tiền tài trợ tối đa 10 tỷ đồng"),
  isAnonymous: z.boolean().default(false),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional().nullable(),
});

export const donationPledgeSchema = z.object({
  campaignId: z.string().uuid("ID chiến dịch không hợp lệ"),
  donorDisplayName: z
    .string()
    .min(2, "Vui lòng nhập họ tên hoặc tên tổ chức tài trợ")
    .optional(),
  isAnonymous: z.boolean().default(false),
  amount: z.coerce
    .number()
    .positive("Số tiền cam kết tài trợ phải lớn hơn 0")
    .max(10_000_000_000, "Số tiền tài trợ tối đa 10 tỷ đồng"),
  note: z.string().optional().nullable(),
});

export const scholarshipApplicationReviewSchema = z.object({
  status: z.enum(["reviewing", "approved", "rejected"]),
  score: z.coerce.number().min(0).max(100).optional().nullable(),
  awardedAmount: z.coerce.number().min(0).optional().nullable(),
  reviewNote: z.string().optional().nullable(),
});

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type DonationPledgeInput = z.infer<typeof donationPledgeSchema>;
export type PledgeDonationInput = z.infer<typeof pledgeDonationSchema>;
export type RecordDonationOnBehalfInput = z.infer<
  typeof recordDonationOnBehalfSchema
>;
export type ScholarshipApplicationReviewInput = z.infer<
  typeof scholarshipApplicationReviewSchema
>;
