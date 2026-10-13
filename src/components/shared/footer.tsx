import Link from "next/link";
import { DluLogo } from "@/components/shared/dlu-logo";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/lib/site-config";

const exploreLinks = [
  { href: "/news", label: "Tin tức" },
  { href: "/events", label: "Sự kiện" },
  { href: "/experiences", label: "Góc chia sẻ" },
  { href: "/jobs", label: "Cơ hội việc làm" },
  { href: "/scholarships", label: "Quỹ khuyến học" },
  { href: "/about", label: "Giới thiệu" },
];

const partnerLinks = [
  { href: "/register?role=employer", label: "Đăng ký hồ sơ công ty" },
  { href: "/employer/jobs/new", label: "Đăng tin tuyển dụng" },
  {
    href: "/account/scholarships/pledge",
    label: "Đồng hành cùng học bổng",
  },
  { href: "/login", label: "Cổng doanh nghiệp" },
];

export const Footer = () => {
  return (
    <footer className="border-t-4 border-primary bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-4">
            <a
              href="/"
              aria-label="Tải lại trang chủ DLU Alumni"
              className="flex w-fit items-center gap-3"
            >
              <DluLogo className="size-14" alt="" />
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold tracking-tight text-primary">
                  {SITE.appName}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Dự án kết nối cộng đồng
                </span>
              </div>
            </a>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Một nơi để trở về, sẻ chia và đồng hành. Kết nối các thế hệ sinh
              viên toàn {SITE.universityName}.
            </p>
          </div>

          <nav
            aria-label="Khám phá DLU Alumni"
            className="flex flex-col gap-5 lg:col-span-2"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Khám phá
            </h2>
            <ul className="flex flex-col gap-3 text-xs text-muted-foreground">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Dành cho doanh nghiệp"
            className="flex flex-col gap-5 lg:col-span-3"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Cùng đồng hành
            </h2>
            <ul className="flex flex-col gap-3 text-xs text-muted-foreground">
              {partnerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-5 lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              <Link href="/contact" className="hover:text-primary">
                Hỗ trợ & góp ý
              </Link>
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Gửi câu hỏi, báo lỗi hoặc đề xuất cải thiện trải nghiệm trên DLU
              Alumni tới bộ phận quản trị dự án.
            </p>
            <Link
              href="/contact"
              className="w-fit text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Gửi tin nhắn <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <Separator className="mt-10" />
        <div className="grid items-end gap-8 pt-6 md:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="flex flex-col gap-4 text-[11px] text-muted-foreground">
            <p>© 2026 {SITE.appName} · Dự án kết nối cộng đồng</p>
            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/about"
                className="transition-colors hover:text-primary"
              >
                Về DLU Alumni
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-primary"
              >
                Bảo mật dữ liệu
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-primary"
              >
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
          <section
            aria-labelledby="footer-university-contact"
            className="flex w-full max-w-sm flex-col gap-3 justify-self-end"
          >
            <h2
              id="footer-university-contact"
              className="text-xs font-semibold text-foreground"
            >
              {SITE.universityName}
            </h2>
            <address className="text-xs not-italic leading-relaxed text-muted-foreground">
              <dl className="flex flex-col gap-3">
                <div className="grid grid-cols-[3.5rem_1fr] gap-2">
                  <dt>Địa chỉ</dt>
                  <dd>{SITE.universityContact.address}</dd>
                </div>
                <div className="grid grid-cols-[3.5rem_1fr] gap-2">
                  <dt>Điện thoại</dt>
                  <dd>
                    <a
                      href={SITE.universityContact.phoneHref}
                      className="underline-offset-4 hover:text-primary hover:underline"
                    >
                      {SITE.universityContact.phone}
                    </a>
                  </dd>
                </div>
                <div className="grid grid-cols-[3.5rem_1fr] gap-2">
                  <dt>Email</dt>
                  <dd>
                    <a
                      href={`mailto:${SITE.universityContact.email}`}
                      className="break-all underline-offset-4 hover:text-primary hover:underline"
                    >
                      {SITE.universityContact.email}
                    </a>
                  </dd>
                </div>
              </dl>
            </address>
          </section>
        </div>
      </div>
    </footer>
  );
};
