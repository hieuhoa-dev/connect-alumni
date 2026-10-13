"use client";

import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
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
import { getInternalHref } from "@/lib/internal-href";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") || "/dashboard";
  const callbackUrl = getInternalHref(rawCallback) ?? "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);
    try {
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
    } catch {
      setError("Không thể kết nối tới hệ thống. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Đăng nhập
          </CardTitle>
          <CardDescription>
            Nhập email và mật khẩu tài khoản của bạn để truy cập hệ thống
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
              className="w-full font-medium"
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
      {process.env.NODE_ENV === "development" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Tài khoản mẫu cho môi trường trình diễn</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-2">
            <p className="text-[11px] text-muted-foreground">
              Bấm chọn để tự động điền tài khoản mẫu (Mật khẩu chung:{" "}
              <code className="font-mono font-semibold">Password123!</code>):
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("staff@khoacntt.edu.vn")}
                className="flex items-center justify-between rounded p-1.5 text-left text-xs bg-background/80 hover:bg-background border border-border transition-colors"
              >
                <div>
                  <div className="font-medium text-foreground">
                    Tài khoản vận hành mẫu
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Quản lý nội dung và hoạt động cộng đồng
                  </div>
                </div>
                <Badge className="text-[10px] bg-indigo-600 text-white">
                  Vận hành
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin@khoacntt.edu.vn")}
                className="flex items-center justify-between rounded p-1.5 text-left text-xs bg-background/80 hover:bg-background border border-border transition-colors"
              >
                <div>
                  <div className="font-medium text-foreground">
                    Tài khoản quản trị mẫu
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Quản lý tài khoản và phân quyền
                  </div>
                </div>
                <Badge className="text-[10px] bg-destructive text-destructive-foreground">
                  Admin
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("student.hoa@khoacntt.edu.vn")}
                className="flex items-center justify-between rounded p-1.5 text-left text-xs bg-background/80 hover:bg-background border border-border transition-colors"
              >
                <div>
                  <div className="font-medium text-foreground">
                    Tài khoản sinh viên mẫu
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Sự kiện, học bổng và khảo sát
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Sinh viên
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("alumni.le@gmail.com")}
                className="flex items-center justify-between rounded p-1.5 text-left text-xs bg-background/80 hover:bg-background border border-border transition-colors"
              >
                <div>
                  <div className="font-medium text-foreground">
                    Tài khoản cựu sinh viên mẫu
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Chia sẻ kinh nghiệm và tham gia sự kiện
                  </div>
                </div>
                <Badge className="text-[10px] bg-amber-600 text-white">
                  Alumni
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("hr@vng.com.vn")}
                className="flex items-center justify-between rounded p-1.5 text-left text-xs bg-background/80 hover:bg-background border border-border transition-colors"
              >
                <div>
                  <div className="font-medium text-foreground">
                    Tài khoản doanh nghiệp mẫu
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Tuyển dụng và đồng hành cùng học bổng
                  </div>
                </div>
                <Badge className="text-[10px] bg-emerald-600 text-white">
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
