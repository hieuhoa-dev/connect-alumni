import * as React from "react";
import Link from "next/link";
import { DLULogo } from "@/components/shared/dlu-logo";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-[#1E4D2B]/20 bg-[#1E4D2B]/5 text-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <DLULogo size={38} />
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-[#1E4D2B]">
                  DLU ALUMNI
                </span>
                <span className="text-[10px] font-semibold text-[#E67300] uppercase tracking-wide">
                  Trường Đại học Đà Lạt
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nền tảng chính thức kết nối các thế hệ Cựu sinh viên — Trường Đại học Đà Lạt — Doanh nghiệp đối tác và Sinh viên.
            </p>
            <div className="text-xs text-[#1E4D2B] font-medium">
              Đồ án tốt nghiệp hệ thống kết nối cựu sinh viên
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E4D2B]">
              Khám phá
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/jobs"
                  className="hover:text-[#1E4D2B] transition-colors"
                >
                  Cơ hội việc làm
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-[#1E4D2B] transition-colors"
                >
                  Talkshow & Sự kiện
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="hover:text-[#1E4D2B] transition-colors"
                >
                  Chia sẻ kinh nghiệm
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarships"
                  className="hover:text-[#1E4D2B] transition-colors"
                >
                  Quỹ Khuyến học & Tài trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* For partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E4D2B]">
              Dành cho Đối tác
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/employer/onboarding"
                  className="hover:text-[#1E4D2B] transition-colors"
                >
                  Đăng ký hồ sơ công ty
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/jobs/new"
                  className="hover:text-[#1E4D2B] transition-colors"
                >
                  Đăng tin tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/scholarships/pledge"
                  className="hover:text-[#1E4D2B] transition-colors"
                >
                  Cam kết tài trợ học bổng
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-[#1E4D2B] transition-colors"
                >
                  Cổng kết nối Doanh nghiệp
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E4D2B]">
              Liên hệ Trường Đại học Đà Lạt
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#1E4D2B] mt-0.5" />
                <span>
                  Số 01 Phù Đổng Thiên Vương, Phường 8, TP. Đà Lạt, Tỉnh Lâm Đồng
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#1E4D2B]" />
                <span>alumni@dlu.edu.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#1E4D2B]" />
                <span>(0263) 3822 246</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0 text-[#1E4D2B]" />
                <span>https://dlu.edu.vn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>
            © 2026 Trường Đại học Đà Lạt. Bản quyền thuộc về Mạng lưới Cựu sinh viên DLU.
          </p>
          <div className="flex items-center gap-4">
            <span>Bảo mật dữ liệu cá nhân</span>
            <span>Điều khoản sử dụng</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
