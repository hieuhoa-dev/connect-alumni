import { z } from "zod";

export const jobPostSchema = z.object({
  title: z.string().min(3, "Tiêu đề công việc ít nhất 3 ký tự"),
  description: z.string().min(10, "Mô tả công việc ít nhất 10 ký tự"),
  requirements: z.string().min(10, "Yêu cầu công việc ít nhất 10 ký tự"),
  location: z.string().min(2, "Địa điểm làm việc không được để trống"),
  jobType: z.enum(["full_time", "part_time", "internship"], {
    message: "Hình thức làm việc không hợp lệ",
  }),
  salaryRange: z.string().optional().nullable(),
  applyUrlOrEmail: z
    .string()
    .min(3, "Vui lòng nhập link nộp CV hoặc email nhận hồ sơ"),
  expiresAt: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  companyId: z.string().uuid("ID công ty không hợp lệ"),
});

export const jobReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectedReason: z.string().optional().nullable(),
});

export type JobPostInput = z.infer<typeof jobPostSchema>;
export type JobReviewInput = z.infer<typeof jobReviewSchema>;
