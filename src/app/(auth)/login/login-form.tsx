"use client";

import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { DLULogo } from "@/components/shared/dlu-logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface LoginFormProps {
  demoEnabled: boolean;
}

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

const mapAuthError = (err: string | null | undefined): string => {
  if (!err) return "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
  if (err.includes("INVALID_DOMAIN") || err.includes("dlu.edu.vn")) {
    return "Hệ thống chỉ chấp nhận tài khoản Google thuộc miền @dlu.edu.vn của Trường Đại học Đà Lạt.";
  }
  if (err.includes("ACCESS_DENIED") || err.includes("access_denied")) {
    return "Bạn đã từ chối cấp quyền truy cập từ tài khoản Google.";
  }
  if (err.includes("rate_limit") || err.includes("too many")) {
    return "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.";
  }
  return err;
};

export const LoginForm = ({ demoEnabled }: LoginFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || searchParams.get("callbackUrl");
  const urlError = searchParams.get("error");

  // Prevent open redirect: must be internal relative path starting with / and not //
  const safeNext =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : null;
  const defaultCallback = safeNext || "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(
    urlError ? mapAuthError(urlError) : null,
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: defaultCallback,
      });
    } catch (err: any) {
      setIsGoogleLoading(false);
      setError(mapAuthError(err?.message));
    }
  };

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
          router.push(defaultCallback);
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

      const destination = safeNext || data.redirectUrl;
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
      <Card className="border-border/80 shadow-brand-lg backdrop-blur-md bg-white/95 dark:bg-card/95">
        <CardHeader className="space-y-2 text-center pb-3">
          <div className="flex justify-center">
            <DLULogo size={56} />
          </div>
          <CardTitle className="text-xl font-bold font-serif text-foreground">
            Đăng nhập hệ thống
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Chào mừng bạn trở về Mạng lưới Cựu sinh viên & Hợp tác Doanh nghiệp
            Trường Đại học Đà Lạt
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {error && (
            <Alert variant="destructive" className="py-2.5 text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google OAuth Button */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full h-10 text-xs font-semibold bg-card flex items-center justify-center gap-2.5 border-border/80 hover:bg-muted/60 cursor-pointer shadow-2xs"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang kết nối Google...
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Đăng nhập bằng tài khoản Google
                </>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Dành cho tài khoản email của Trường (@dlu.edu.vn)
            </p>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-mono">
                Hoặc sử dụng email & mật khẩu
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email" className="text-xs font-semibold">
                Địa chỉ Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@dlu.edu.vn hoặc email cá nhân"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="text-xs h-10"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold">
                  Mật khẩu
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="text-xs h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full text-xs font-semibold h-10 shadow-xs"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

      {/* Demo Fast Login Box for Reviewers (Only visible when ENABLE_DEMO_LOGIN=true and non-production) */}
      {demoEnabled && (
        <Card className="border-pine-400/40 bg-white/95 dark:bg-card/95 shadow-brand backdrop-blur-md">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-pine-800">
                <Sparkles className="h-4 w-4 text-sun-600" />
                <span>Tài khoản demo sẵn dùng (Bấm vào để vào ngay)</span>
              </div>
              {isLoading && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-pine-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-2">
            <p className="text-[11px] text-muted-foreground">
              Bấm trực tiếp vào tài khoản bên dưới để đăng nhập tức thì vào hệ
              thống:
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin("staff@khoacntt.edu.vn")}
                className="flex items-center justify-between rounded-lg p-2.5 text-left text-xs bg-card hover:bg-muted/80 border border-border transition-all hover:border-pine-400 shadow-2xs cursor-pointer active:scale-[0.99]"
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
                className="flex items-center justify-between rounded-lg p-2.5 text-left text-xs bg-card hover:bg-muted/80 border border-border transition-all hover:border-pine-400 shadow-2xs cursor-pointer active:scale-[0.99]"
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
      )}
    </div>
  );
};
