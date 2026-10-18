import { z } from "zod";

const currentYear = new Date().getFullYear();

export const registerSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ").max(255),
  password: z
    .string()
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .max(100, "Mật khẩu tối đa 100 ký tự"),
  name: z
    .string()
    .min(2, "Họ và tên tối thiểu 2 ký tự")
    .max(100, "Họ và tên tối đa 100 ký tự"),
  role: z.enum(["student", "alumni", "employer"], {
    message: "Vai trò đăng ký chỉ có thể là Sinh viên, Cựu sinh viên hoặc Doanh nghiệp",
  }),
  studentCode: z.string().max(20).optional(),
  faculty: z.string().max(100).optional(),
  batchYear: z
    .number()
    .int()
    .min(1976, "Khóa tuyển sinh không hợp lệ")
    .max(currentYear + 6, "Khóa tuyển sinh không hợp lệ")
    .optional(),
  graduationYear: z
    .number()
    .int()
    .min(1980, "Năm tốt nghiệp không hợp lệ")
    .max(currentYear + 10, "Năm tốt nghiệp không hợp lệ")
    .optional(),
  phone: z.string().max(20, "Số điện thoại không hợp lệ").optional(),
  bio: z.string().max(1000, "Tiểu sử tối đa 1000 ký tự").optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
