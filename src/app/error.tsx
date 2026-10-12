"use client";

import { Button } from "@/components/ui/button";

const ErrorPage = ({ retry }: { retry: () => void }) => (
  <main className="mx-auto flex w-full max-w-xl flex-col items-start gap-4 px-6 py-24">
    <h1 className="text-2xl font-semibold tracking-tight">
      Chưa thể tải trang
    </h1>
    <p className="text-muted-foreground">
      Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau ít phút.
    </p>
    <Button onClick={() => retry()}>Thử lại</Button>
  </main>
);

export default ErrorPage;
