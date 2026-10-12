import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { SITE } from "@/lib/site-config";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-md bg-primary font-serif text-lg tracking-tight text-primary-foreground"
              >
                ca.
              </div>
              <span className="text-xs font-semibold tracking-[0.06em] text-foreground">
                CONNECT ALUMNI
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kết nối sinh viên, cựu sinh viên và doanh nghiệp cùng{" "}
              {SITE.facultyName}, {SITE.universityName}.
            </p>
            <div className="text-xs text-muted-foreground">
              Cơ hội nghề nghiệp. Kinh nghiệm thực tế. Sự đồng hành.
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Khám phá
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/news"
                  className="hover:text-foreground transition-colors"
                >
                  Tin tức
                </Link>
              </li>
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
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  Giới thiệu & Cựu sinh viên
                </Link>
              </li>
            </ul>
          </div>

          {/* For partners */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Dành cho Đối tác
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/register?role=employer"
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
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              <Link
                href="/contact"
                className="hover:underline underline-offset-4"
              >
                Văn phòng Khoa CNTT
              </Link>
            </h4>
            <div className="flex flex-col gap-3 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <span>{SITE.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a
                  href={`mailto:${SITE.email}`}
                  className="break-all hover:text-foreground"
                >
                  {SITE.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a href={SITE.phoneHref} className="hover:text-foreground">
                  {SITE.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© 2026 Connect Alumni · CNTT Đại học Đà Lạt</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={SITE.facultyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Website Khoa <span aria-hidden="true">↗</span>
            </a>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Bảo mật dữ liệu cá nhân
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
