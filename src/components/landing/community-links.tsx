import Link from "next/link";
import { SITE } from "@/lib/site-config";

export const CommunityLinks = () => (
  <section
    aria-labelledby="community-links-heading"
    className="border-t-2 border-primary pt-8"
  >
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
      <div className="flex max-w-lg flex-col gap-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Khám phá {SITE.appName}
        </p>
        <h2
          id="community-links-heading"
          className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
        >
          Cùng một mái trường,
          <br />
          nhiều thế hệ kết nối.
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          DLU Alumni là dự án riêng dành cho sinh viên, cựu sinh viên toàn
          Trường Đại học Đà Lạt và doanh nghiệp. Cùng chia sẻ kinh nghiệm, tham
          gia hoạt động và tìm những cơ hội đồng hành ngay trên nền tảng.
        </p>
        <Link
          href="/about"
          className="w-fit text-xs text-muted-foreground underline decoration-primary underline-offset-4 transition-colors hover:text-primary"
        >
          Giới thiệu Trường và dự án <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SITE.communityLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex flex-col justify-between gap-5 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-semibold leading-snug">
                {link.label}
              </h3>
              <span
                aria-hidden="true"
                className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
