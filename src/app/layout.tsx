import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connect Alumni · CNTT Đại học Đà Lạt",
  description:
    "Kết nối sinh viên, cựu sinh viên và doanh nghiệp cùng Khoa Công nghệ Thông tin, Trường Đại học Đà Lạt.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
