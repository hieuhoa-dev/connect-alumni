"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerWithProfile } from "@/actions/auth-actions";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Award,
} from "lucide-react";

type RoleOption = "student" | "alumni" | "employer";

const GoogleIcon = () => (
  <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const RegisterPage = () => {
  const router = useRouter();

  const [role, setRole] = React.useState<RoleOption>("student");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [studentCode, setStudentCode] = React.useState("");
  const [batchYear, setBatchYear] = React.useState("");
  const [graduationYear, setGraduationYear] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [bio, setBio] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/complete-profile",
      });
    } catch (err: any) {
      setIsGoogleLoading(false);
      setError(err?.message || "Không thể kết nối đến tài khoản Google.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await registerWithProfile({
        name,
        email,
        password,
        role,
        studentCode: role === "student" ? studentCode : undefined,
        batchYear: batchYear ? Number(batchYear) : undefined,
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        phone: phone || undefined,
        bio: bio || undefined,
      });

      // Automatically sign in
      const signInRes = await authClient.signIn.email({
        email,
        password,
      });

      if (signInRes.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi trong quá trình đăng ký");
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-brand-lg backdrop-blur-md bg-white/95 dark:bg-card/95">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Đăng ký tài khoản
        </CardTitle>
        <CardDescription>
          Chọn vai trò của bạn để nhận đúng quyền hạn và dịch vụ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Registration Box */}
        <div className="p-3.5 rounded-xl border border-pine-200 bg-pine-50/50 space-y-2">
          <div className="text-xs text-pine-900 font-medium">
            Bạn có email Trường Đại học Đà Lạt (<strong>@dlu.edu.vn</strong>)?
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleRegister}
            disabled={isLoading || isGoogleLoading}
            className="w-full h-9 text-xs font-semibold flex items-center justify-center gap-2 bg-white border-border/80 hover:bg-muted/60 cursor-pointer shadow-2xs"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Đang kết nối...
              </>
            ) : (
              <>
                <GoogleIcon />
                Đăng nhập nhanh bằng Google @dlu.edu.vn
              </>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Sinh viên & Cựu sinh viên có email trường nên sử dụng đăng nhập Google để được xác thực nhanh hơn.
          </p>
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-card px-2 text-muted-foreground font-mono">
              Hoặc đăng ký tài khoản thủ công
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2 text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Role selector tabs */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Vai trò của bạn</Label>
            <Tabs
              value={role}
              onValueChange={(val) => setRole(val as RoleOption)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="student"
                  className="text-xs flex items-center gap-1.5"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Sinh viên
                </TabsTrigger>
                <TabsTrigger
                  value="alumni"
                  className="text-xs flex items-center gap-1.5"
                >
                  <Award className="h-3.5 w-3.5" />
                  Cựu SV
                </TabsTrigger>
                <TabsTrigger
                  value="employer"
                  className="text-xs flex items-center gap-1.5"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  Doanh nghiệp
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              placeholder={
                role === "employer"
                  ? "Tên đại diện doanh nghiệp"
                  : "Nguyễn Văn A"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={
                role === "student"
                  ? "mssv@khoacntt.edu.vn"
                  : role === "employer"
                    ? "hr@company.com"
                    : "alumni@gmail.com"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>

          {/* Role specific inputs */}
          {role === "student" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="studentCode" className="text-xs">
                  Mã số sinh viên
                </Label>
                <Input
                  id="studentCode"
                  placeholder="21110001"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batchYear" className="text-xs">
                  Khoá nhập học (Năm)
                </Label>
                <Input
                  id="batchYear"
                  type="number"
                  placeholder="2021"
                  value={batchYear}
                  onChange={(e) => setBatchYear(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {role === "alumni" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="alumniBatch" className="text-xs">
                  Khoá nhập học
                </Label>
                <Input
                  id="alumniBatch"
                  type="number"
                  placeholder="2018"
                  value={batchYear}
                  onChange={(e) => setBatchYear(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gradYear" className="text-xs">
                  Năm tốt nghiệp
                </Label>
                <Input
                  id="gradYear"
                  type="number"
                  placeholder="2022"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs">
              Số điện thoại liên hệ
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              <>
                Đăng ký tài khoản <ArrowRight data-icon="inline-end" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        <div>
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterPage;
