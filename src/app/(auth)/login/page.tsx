import * as React from "react";
import { Loader2 } from "lucide-react";
import { isDemoEnabled } from "@/lib/demo-accounts";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Đăng nhập | DLU Connect Alumni",
  description: "Đăng nhập Cổng thông tin Cựu sinh viên & Doanh nghiệp Trường Đại học Đà Lạt",
};

const LoginPage = () => {
  const demoEnabled = isDemoEnabled();

  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center p-8 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Đang tải giao diện đăng nhập...
        </div>
      }
    >
      <LoginForm demoEnabled={demoEnabled} />
    </React.Suspense>
  );
};

export default LoginPage;
