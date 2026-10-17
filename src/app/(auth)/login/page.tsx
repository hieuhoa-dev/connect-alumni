"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import { DLULogo } from "@/components/shared/dlu-logo";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError(null);
        },
        onSuccess: () => {
          setIsLoading(false);
          router.push(callbackUrl);
          router.refresh();
        },
        onError: (ctx) => {
          setIsLoading(false);
          setError(
            ctx.error.message ||
              "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.",
          );
        },
      },
    );
  };

  const performDemoLogin = async (targetEmail: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Đăng nhập demo thất bại");
      }

      const destination =
        callbackUrl && callbackUrl !== "/dashboard"
          ? callbackUrl
          : data.redirectUrl;
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "Đã xảy ra lỗi khi đăng nhập.");
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    await performDemoLogin(demoEmail);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-2 text-center pb-3">
          <div className="flex justify-center">
            <Link href="/" title="Về trang chủ">
              <DLULogo size={52} />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Đăng nhập hệ thống
          </CardTitle>
          <CardDescription className="text-xs">
            Cổng kết nối Cựu sinh viên & Doanh nghiệp — Trường Đại học Đà Lạt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2 text-xs">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full font-medium cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  Đăng nhập <ArrowRight data-icon="inline-end" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-xs text-muted-foreground">
          <div>
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Demo Fast Login Box for Reviewers */}
      <Card className="border-[#1E4D2B]/30 bg-[#1E4D2B]/5 shadow-xs">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E4D2B]">
              <Sparkles className="h-4 w-4" />
              <span>Tài khoản demo sẵn dùng (Bấm vào để vào ngay)</span>
            </div>
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1E4D2B]" />}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Bấm trực tiếp vào tài khoản bên dưới để đăng nhập tức thì vào hệ thống:
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin("staff@khoacntt.edu.vn")}
              className="flex items-center justify-between rounded-lg p-2.5 text-left text-xs bg-card hover:bg-muted/80 border border-border transition-all hover:border-[#1E4D2B]/50 shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <div>
                <div className="font-semibold text-foreground">
                  ThS. Trần Thị Giáo Vụ
                </div>
                <div className="text-[10px] text-muted-foreground">
                  staff@khoacntt.edu.vn
                </div>
              </div>
              <Badge className="text-[10px] bg-indigo-600 text-white font-medium">
                Khoa
              </Badge>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin("admin@khoacntt.edu.vn")}
              className="flex items-center justify-between rounded-lg p-2.5 text-left text-xs bg-card hover:bg-muted/80 border border-border transition-all hover:border-destructive/50 shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <div>
                <div className="font-semibold text-foreground">
                  TS. Nguyễn Văn Quản Trị
                </div>
                <div className="text-[10px] text-muted-foreground">
                  admin@khoacntt.edu.vn
                </div>
              </div>
              <Badge className="text-[10px] bg-destructive text-destructive-foreground font-medium">
                Admin
              </Badge>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin("student.hoa@khoacntt.edu.vn")}
              className="flex items-center justify-between rounded-lg p-2.5 text-left text-xs bg-card hover:bg-muted/80 border border-border transition-all hover:border-[#1E4D2B]/50 shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <div>
                <div className="font-semibold text-foreground">
                  Nguyễn Tiến Hoa (Sinh viên K21)
                </div>
                <div className="text-[10px] text-muted-foreground">
                  student.hoa@khoacntt.edu.vn
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] font-medium">
                Sinh viên
              </Badge>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin("alumni.le@gmail.com")}
              className="flex items-center justify-between rounded-lg p-2.5 text-left text-xs bg-card hover:bg-muted/80 border border-border transition-all hover:border-amber-600/50 shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <div>
                <div className="font-semibold text-foreground">
                  Lê Hoàng Nam (Cựu SV K18)
                </div>
                <div className="text-[10px] text-muted-foreground">
                  alumni.le@gmail.com
                </div>
              </div>
              <Badge className="text-[10px] bg-amber-600 text-white font-medium">
                Alumni
              </Badge>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin("hr@vng.com.vn")}
              className="flex items-center justify-between rounded-lg p-2.5 text-left text-xs bg-card hover:bg-muted/80 border border-border transition-all hover:border-emerald-600/50 shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <div>
                <div className="font-semibold text-foreground">
                  Phạm Thu Trang (HR VNG)
                </div>
                <div className="text-[10px] text-muted-foreground">
                  hr@vng.com.vn
                </div>
              </div>
              <Badge className="text-[10px] bg-emerald-600 text-white font-medium">
                Doanh nghiệp
              </Badge>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const LoginPage = () => {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center p-8 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Đang tải...
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
};

export default LoginPage;
