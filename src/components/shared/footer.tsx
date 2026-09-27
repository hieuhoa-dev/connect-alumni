import * as React from "react";
import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin, Globe } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-foreground">
                CONNECT ALUMNI
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nền tảng chính thức kết nối Sinh viên – Khoa Công nghệ Thông tin –
              Cựu sinh viên – Đối tác Doanh nghiệp.
            </p>
            <div className="text-xs text-muted-foreground">
              Đồ án tốt nghiệp Khoa Công nghệ Thông tin
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Khám phá
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/jobs"
                  className="hover:text-foreground transition-colors"
                >
                  Cơ hội việc làm
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-foreground transition-colors"
                >
                  Talkshow & Sự kiện
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="hover:text-foreground transition-colors"
                >
                  Chia sẻ kinh nghiệm
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarships"
                  className="hover:text-foreground transition-colors"
                >
                  Quỹ Khuyến học & Tài trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* For partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Dành cho Đối tác
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/employer/onboarding"
                  className="hover:text-foreground transition-colors"
                >
                  Đăng ký hồ sơ công ty
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/jobs/new"
                  className="hover:text-foreground transition-colors"
                >
                  Đăng tin tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/scholarships/pledge"
                  className="hover:text-foreground transition-colors"
                >
                  Cam kết tài trợ học bổng
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-foreground transition-colors"
                >
                  Cổng kết nối Doanh nghiệp
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Liên hệ Ban Chủ nhiệm Khoa
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <span>
                  Khu Phố 6, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>bcn.cntt@khoacntt.edu.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>(028) 3724 4270</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>
            © 2026 Khoa Công nghệ Thông tin. Bản quyền thuộc về Trường Đại học.
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
