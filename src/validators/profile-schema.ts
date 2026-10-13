import { z } from "zod";

const currentYear = new Date().getFullYear();

/** Chuỗi rỗng được coi là "xóa giá trị" và lưu thành null. */
const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

const optionalYear = z
  .number()
  .int("Năm phải là số nguyên")
  .min(1958, "Năm phải từ 1958")
  .max(currentYear + 6, `Năm tối đa ${currentYear + 6}`)
  .nullish()
  .transform((value) => value ?? null);

export const profileUpdateSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Họ tên ít nhất 2 ký tự")
      .max(100, "Họ tên tối đa 100 ký tự"),
    phone: z
      .string()
      .trim()
      .max(20, "Số điện thoại tối đa 20 ký tự")
      .regex(/^[0-9+().\s-]*$/, "Số điện thoại chỉ gồm chữ số và + ( ) . -")
      .optional()
      .nullable()
      .transform((value) => (value ? value : null)),
    bio: optionalText(1000, "Giới thiệu tối đa 1000 ký tự"),
    avatarUrl: z
      .string()
      .trim()
      .max(500, "Đường dẫn ảnh quá dài")
      .optional()
      .nullable()
      .transform((value) => (value ? value : null))
      .refine((value) => {
        if (value === null) return true;
        try {
          const url = new URL(value);
          return (
            ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname)
          );
        } catch {
          return false;
        }
      }, "Ảnh đại diện phải là đường dẫn http hoặc https"),
    studentCode: optionalText(20, "Mã sinh viên tối đa 20 ký tự"),
    faculty: optionalText(150, "Khoa/ngành tối đa 150 ký tự"),
    batchYear: optionalYear,
    graduationYear: optionalYear,
  })
  .refine(
    (value) =>
      value.batchYear === null ||
      value.graduationYear === null ||
      value.graduationYear >= value.batchYear,
    {
      path: ["graduationYear"],
      message: "Năm tốt nghiệp không thể trước năm nhập học",
    },
  );

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới ít nhất 8 ký tự")
      .max(128, "Mật khẩu mới tối đa 128 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
  });
