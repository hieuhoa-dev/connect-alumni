import { z } from "zod";
import { NEWS_CATEGORIES } from "@/lib/text";

const httpUrl = z
  .string()
  .trim()
  .refine(
    (v) => /^https?:\/\/\S+$/i.test(v),
    "Ảnh bìa phải là đường dẫn http(s) hợp lệ",
  );

export const newsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Tiêu đề ít nhất 5 ký tự")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  summary: z
    .string()
    .trim()
    .max(300, "Tóm tắt tối đa 300 ký tự")
    .optional()
    .nullable(),
  content: z.string().min(20, "Nội dung bài viết ít nhất 20 ký tự"),
  category: z.enum(NEWS_CATEGORIES, { message: "Chuyên mục không hợp lệ" }),
  coverImageUrl: httpUrl.optional().nullable().or(z.literal("")),
  isPinned: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type NewsInput = z.input<typeof newsSchema>;
export type NewsParsed = z.output<typeof newsSchema>;
