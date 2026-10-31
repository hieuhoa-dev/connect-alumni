import * as React from "react";
import Link from "next/link";
import { DLULogo } from "@/components/shared/dlu-logo";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { getSiteSettings } from "@/server/dal/settings";

export const Footer = async () => {
  const settings = await getSiteSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-pine-950 text-white border-t border-pine-800">
      <div className="container mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-1 shrink-0 shadow-md">
                <DLULogo size={40} />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white leading-none">
                  DLU CONNECT
                </span>
                <span className="text-[10px] font-bold text-gold-300 uppercase tracking-wider mt-1">
                  Trường Đại học Đà Lạt
                </span>
              </div>
            </div>
            <p className="text-xs text-pine-200 leading-relaxed font-sans">
              Nền tảng chính thức kết nối các thế hệ Cựu sinh viên — Trường Đại học Đà Lạt — Doanh nghiệp đối tác và Sinh viên.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-lime-300 font-mono font-medium">
              <span>Đồ án tốt nghiệp Khoa CNTT</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-300 font-mono">
              Khám phá
            </h4>
            <ul className="space-y-2 text-sm text-pine-200">
              <li>
                <Link
                  href="/jobs"
                  className="hover:text-lime-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Cơ hội việc làm</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-lime-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Talkshow &amp; Sự kiện</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="hover:text-lime-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Thư viện ảnh</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="hover:text-lime-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Góc chia sẻ kinh nghiệm</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarships"
                  className="hover:text-lime-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Quỹ Khuyến học &amp; Tài trợ</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* For partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-300 font-mono">
              Dành cho Doanh nghiệp
            </h4>
            <ul className="space-y-2 text-sm text-pine-200">
              <li>
                <Link
                  href="/employer/onboarding"
                  className="hover:text-lime-300 transition-colors"
                >
                  Đăng ký hồ sơ công ty
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/jobs/new"
                  className="hover:text-lime-300 transition-colors"
                >
                  Đăng tin tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/scholarships/pledge"
                  className="hover:text-lime-300 transition-colors"
                >
                  Tài trợ quỹ khuyến học
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-lime-300 transition-colors"
                >
                  Cổng đăng nhập đối tác
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-300 font-mono">
              Khoa Công nghệ Thông tin
            </h4>
            <div className="space-y-2.5 text-xs text-pine-200">
              {settings.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-lime-300 mt-0.5" />
                  {settings.mapUrl ? (
                    <a
                      href={settings.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-lime-300 transition-colors leading-relaxed"
                    >
                      {settings.address}
                    </a>
                  ) : (
                    <span>{settings.address}</span>
                  )}
                </div>
              )}

              {settings.contactPhone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-lime-300" />
                  <a
                    href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}
                    className="hover:text-lime-300 transition-colors font-mono font-medium"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              )}

              {settings.contactEmail && (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-lime-300" />
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="hover:text-lime-300 transition-colors font-mono"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              )}

              {settings.websiteUrl && (
                <div className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 shrink-0 text-lime-300" />
                  <a
                    href={settings.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-lime-300 transition-colors underline-offset-4 hover:underline"
                  >
                    {settings.websiteUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-pine-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-pine-300 gap-4">
          <p>
            © {currentYear} Trường Đại học Đà Lạt. Bản quyền thuộc về Mạng lưới Cựu sinh viên DLU.
          </p>
          <div className="flex items-center gap-4 text-pine-300">
            <span className="hover:text-white transition-colors cursor-pointer">
              Bảo mật dữ liệu cá nhân
            </span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Điều khoản sử dụng
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
