import type { Metadata } from "next";
import localFont from "next/font/local";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import "./globals.css";

const headingFont = localFont({
  src: "../components/landing/fonts/BeVietnamPro-SemiBold.ttf",
  weight: "600",
  style: "normal",
  display: "swap",
  variable: "--font-dlu-heading",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DLU Alumni · Đại học Đà Lạt",
  description:
    "Dự án riêng kết nối sinh viên, cựu sinh viên và doanh nghiệp trong cộng đồng Đại học Đà Lạt.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="vi" className={cn("h-full antialiased", headingFont.variable)}>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
