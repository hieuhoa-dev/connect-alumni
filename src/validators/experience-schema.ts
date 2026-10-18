import { z } from "zod";

export const experiencePostSchema = z.object({
  title: z.string().min(5, "Tiêu đề bài viết ít nhất 5 ký tự"),
  content: z.string().min(20, "Nội dung chia sẻ ít nhất 20 ký tự"),
  coverImageUrl: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export const experienceReviewSchema = z
  .object({
    status: z.enum(["published", "rejected"]),
    rejectedReason: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.status === "rejected") {
        return typeof data.rejectedReason === "string" && data.rejectedReason.trim().length >= 5;
      }
      return true;
    },
    {
      message: "Vui lòng nhập lý do từ chối ít nhất 5 ký tự",
      path: ["rejectedReason"],
    }
  );

export type ExperiencePostInput = z.infer<typeof experiencePostSchema>;
export type ExperienceReviewInput = z.infer<typeof experienceReviewSchema>;
