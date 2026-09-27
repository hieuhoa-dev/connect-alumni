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
  title: "Khoa CNTT - Mạng Lưới Cựu Sinh Viên & Hợp Tác Doanh Nghiệp",
  description:
    "Cổng thông tin kết nối Sinh viên - Cựu sinh viên - Doanh nghiệp - Khoa Công nghệ Thông tin",
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
