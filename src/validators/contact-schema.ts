import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên")
    .max(100, "Họ tên tối đa 100 ký tự"),
  email: z.string().trim().email("Email không hợp lệ").max(150),
  phone: z
    .string()
    .trim()
    .max(20, "Số điện thoại tối đa 20 ký tự")
    .regex(/^[0-9+().\s-]*$/, "Số điện thoại chỉ gồm chữ số và + ( ) . -")
    .optional()
    .nullable()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(3, "Vui lòng nhập tiêu đề")
    .max(150, "Tiêu đề tối đa 150 ký tự"),
  message: z
    .string()
    .trim()
    .min(10, "Nội dung ít nhất 10 ký tự")
    .max(3000, "Nội dung tối đa 3000 ký tự"),
  /** Ô ẩn chống bot: người thật không nhìn thấy nên luôn để trống. */
  website: z.string().max(0).optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
