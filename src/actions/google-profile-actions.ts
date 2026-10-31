"use server";

import { z } from "zod";
import { db } from "@/db";
import { profiles, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";
import { isSafeHref } from "@/lib/safe-url";

const completeGoogleProfileSchema = z.object({
  role: z.enum(["student", "alumni"], {
    message: "Bạn chỉ có thể chọn vai trò Sinh viên hoặc Cựu sinh viên.",
  }),
  fullName: z.string().min(2, "Họ và tên ít nhất 2 ký tự"),
  studentCode: z
    .string()
    .regex(/^[0-9]{7}$/, "Mã số sinh viên (MSSV) của Trường ĐH Đà Lạt phải đúng 7 chữ số"),
  batchYear: z.coerce.number().int().min(1976).max(new Date().getFullYear()),
  graduationYear: z.coerce
    .number()
    .int()
    .min(1976)
    .max(new Date().getFullYear() + 7)
    .optional()
    .nullable(),
  next: z.string().optional(),
});

export type CompleteGoogleProfileInput = z.infer<typeof completeGoogleProfileSchema>;

export const completeGoogleProfile = async (input: CompleteGoogleProfileInput) => {
  const current = await getCurrentUser();

  if (!current?.user) {
    return {
      success: false,
      error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại bằng Google.",
    };
  }

  // Check if profile already exists
  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, current.user.id));

  if (existingProfile) {
    return {
      success: true,
      redirectUrl: existingProfile.role === "alumni" || existingProfile.role === "student" ? "/student/dashboard" : "/",
    };
  }

  const parsed = completeGoogleProfileSchema.safeParse(input);
  if (!parsed.success) {
    const firstErr = parsed.error.issues[0]?.message || "Thông tin nhập vào không hợp lệ";
    return { success: false, error: firstErr };
  }

  const data = parsed.data;

  // Additional check: If alumni, graduationYear should be >= batchYear
  if (data.role === "alumni" && data.graduationYear && data.graduationYear < data.batchYear) {
    return {
      success: false,
      error: "Năm tốt nghiệp phải sau hoặc bằng năm nhập học khóa.",
    };
  }

  try {
    // 1. Insert profile
    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId: current.user.id,
        role: data.role,
        fullName: data.fullName.trim(),
        studentCode: data.studentCode.trim(),
        batchYear: data.batchYear,
        graduationYear: data.role === "alumni" ? data.graduationYear || null : null,
        avatarUrl: current.user.image || null,
        status: "active",
        visibility: "members",
      })
      .returning();

    // 2. Update user name if different
    if (data.fullName.trim() !== current.user.name) {
      await db
        .update(user)
        .set({ name: data.fullName.trim() })
        .where(eq(user.id, current.user.id));
    }

    // 3. Audit log
    await logAuditEvent({
      actorId: current.user.id,
      action: "complete_profile_google",
      entityType: "profile",
      entityId: newProfile.id,
      metadata: { role: data.role, studentCode: data.studentCode },
    });

    // 4. Safe redirect url
    let target = "/student/dashboard";
    if (data.next && isSafeHref(data.next) && data.next.startsWith("/")) {
      target = data.next;
    }

    return { success: true, redirectUrl: target };
  } catch (err: any) {
    console.error("completeGoogleProfile error:", err);
    if (err?.code === "23505" || err?.message?.includes("unique")) {
      return {
        success: false,
        error: "Mã số sinh viên này đã được đăng ký trong hệ thống. Vui lòng liên hệ Văn phòng Khoa để được hỗ trợ.",
      };
    }
    return { success: false, error: err?.message || "Không thể hoàn tất hồ sơ." };
  }
};
