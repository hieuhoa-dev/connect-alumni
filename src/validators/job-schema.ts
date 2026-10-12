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
    .trim()
    .min(3, "Vui lòng nhập link nộp CV hoặc email nhận hồ sơ")
    .refine((value) => {
      if (z.email().safeParse(value).success) return true;
      try {
        const url = new URL(value);
        return (
          (url.protocol === "http:" || url.protocol === "https:") &&
          !/\s/.test(value)
        );
      } catch {
        return false;
      }
    }, "Nhập đường link http(s) hoặc địa chỉ email hợp lệ"),
  expiresAt: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((d) => !Number.isNaN(d.getTime()), "Ngày hết hạn không hợp lệ")
    .refine((d) => d.getTime() > Date.now(), "Ngày hết hạn phải ở tương lai"),
  companyId: z.string().uuid("ID công ty không hợp lệ"),
});

export const jobReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectedReason: z.string().optional().nullable(),
});

export type JobPostInput = z.infer<typeof jobPostSchema>;
export type JobReviewInput = z.infer<typeof jobReviewSchema>;
