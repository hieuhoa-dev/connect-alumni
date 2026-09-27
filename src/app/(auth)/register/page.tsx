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
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Đăng ký tài khoản
        </CardTitle>
        <CardDescription>
          Chọn vai trò của bạn để nhận đúng quyền hạn và dịch vụ
        </CardDescription>
      </CardHeader>
      <CardContent>
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
