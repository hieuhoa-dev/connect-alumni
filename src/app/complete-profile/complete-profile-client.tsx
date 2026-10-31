"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DLULogo } from "@/components/shared/dlu-logo";
import { completeGoogleProfile } from "@/actions/google-profile-actions";
import { toast } from "@/components/ui/toast";

interface UserInfo {
  name: string;
  email: string;
  image?: string | null;
}

interface CompleteProfileClientProps {
  user: UserInfo;
  nextUrl?: string;
}

export const CompleteProfileClient = ({
  user,
  nextUrl,
}: CompleteProfileClientProps) => {
  const router = useRouter();

  const [role, setRole] = React.useState<"student" | "alumni">("student");
  const [fullName, setFullName] = React.useState(user.name || "");
  const [studentCode, setStudentCode] = React.useState("");
  const [batchYear, setBatchYear] = React.useState(2022);
  const [graduationYear, setGraduationYear] = React.useState(2026);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentCode.trim() || !/^[0-9]{7}$/.test(studentCode.trim())) {
      setErrorMsg("Mã số sinh viên (MSSV) của Trường ĐH Đà Lạt phải đúng 7 chữ số (ví dụ: 2011234).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completeGoogleProfile({
        role,
        fullName: fullName.trim(),
        studentCode: studentCode.trim(),
        batchYear,
        graduationYear: role === "alumni" ? graduationYear : undefined,
        next: nextUrl,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Không thể cập nhật hồ sơ");
        setIsSubmitting(false);
        return;
      }

      toast.success("Hoàn tất hồ sơ thành công! Đang chuyển hướng đến bảng điều khiển...");
      router.push(res.redirectUrl || "/student/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Lỗi khi lưu thông tin");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-pine-50/50 via-background to-background flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-card p-8 sm:p-10 rounded-2xl border border-pine-200/80 shadow-brand">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <DLULogo />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pine-100 text-pine-800 dark:bg-pine-900/70 dark:text-pine-200 border border-pine-200">
            <Sparkles className="size-3.5 text-primary" />
            Xác Thực Tài Khoản Google DLU
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Hoàn Tất Hồ Sơ Của Bạn
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Bạn đã đăng nhập thành công bằng email Trường Đại học Đà Lạt. Vui lòng cung cấp thêm thông tin sinh viên để kích hoạt tài khoản.
          </p>
        </div>

        {/* User preview banner from Google */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/50 border border-border">
          <div className="relative size-12 rounded-full overflow-hidden bg-primary/10 shrink-0 border border-border">
            {user.image ? (
              <Image src={user.image} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="size-full flex items-center justify-center font-bold text-primary">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{user.email}</p>
          </div>
          <div className="size-2 rounded-full bg-emerald-500 shrink-0" title="Email DLU hợp lệ" />
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Bạn đang là: <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  role === "student"
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                    : "border-border hover:border-border/80 bg-background"
                }`}
              >
                <GraduationCap
                  className={`size-5 shrink-0 mt-0.5 ${
                    role === "student" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div>
                  <div className="font-bold text-xs sm:text-sm text-foreground">
                    Sinh Viên Hiện Tại
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Đang theo học tại Trường
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("alumni")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  role === "alumni"
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                    : "border-border hover:border-border/80 bg-background"
                }`}
              >
                <UserCheck
                  className={`size-5 shrink-0 mt-0.5 ${
                    role === "alumni" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div>
                  <div className="font-bold text-xs sm:text-sm text-foreground">
                    Cựu Sinh Viên
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Đã tốt nghiệp ra trường
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Full name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Họ và tên đầy đủ <span className="text-destructive">*</span>
            </label>
            <Input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>

          {/* Student Code */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>
                Mã số sinh viên (MSSV) <span className="text-destructive">*</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                Đúng 7 chữ số (ví dụ: 2011234)
              </span>
            </label>
            <Input
              required
              maxLength={7}
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Nhập 7 chữ số MSSV"
              className="font-mono tracking-wider"
            />
          </div>

          {/* Batch Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Năm nhập học (Khóa) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                required
                min={1976}
                max={new Date().getFullYear()}
                value={batchYear}
                onChange={(e) => setBatchYear(parseInt(e.target.value, 10) || 2022)}
                className="font-mono"
              />
            </div>

            {role === "alumni" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Năm tốt nghiệp <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  required
                  min={1976}
                  max={new Date().getFullYear() + 2}
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(parseInt(e.target.value, 10) || 2026)}
                  className="font-mono"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting}
            className="w-full py-2.5 font-bold cursor-pointer"
          >
            {isSubmitting ? "Đang xử lý..." : "Hoàn Tất Đăng Ký & Vào Hệ Thống"}
          </Button>
        </form>
      </div>
    </div>
  );
};
