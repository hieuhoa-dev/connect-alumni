import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toast";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trường Đại học Đà Lạt - Mạng Lưới Cựu Sinh Viên & Hợp Tác Doanh Nghiệp (DLU Alumni)",
  description:
    "Cổng thông tin chính thức kết nối Cựu sinh viên - Doanh nghiệp - Sinh viên Trường Đại học Đà Lạt",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
