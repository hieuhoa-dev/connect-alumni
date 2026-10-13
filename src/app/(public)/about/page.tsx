import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { JoinBand, Tag } from "@/components/landing/landing-parts";
import { PublicPageTitle } from "@/components/shared/public-page-title";
import { UniversityIntroduction } from "@/components/shared/university-introduction";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Giới thiệu · DLU Alumni",
  description:
    "Tìm hiểu Trường Đại học Đà Lạt và DLU Alumni, dự án kết nối sinh viên, cựu sinh viên của tất cả các khoa, ngành trong trường.",
};

const AboutPage = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="flex max-w-3xl flex-col gap-4 pb-12">
        <Tag tone="blue">Giới thiệu</Tag>
        <PublicPageTitle>DLU Alumni, nơi cộng đồng kết nối.</PublicPageTitle>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {SITE.mission}
        </p>
        <nav
          aria-label="Nội dung giới thiệu"
          className="flex flex-wrap gap-x-6 gap-y-3 pt-2 text-sm"
        >
          <a
            href="#ve-truong"
            className="underline decoration-primary underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Về Đại học Đà Lạt
          </a>
          <a
            href="#ve-du-an"
            className="underline decoration-primary underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Về DLU Alumni
          </a>
        </nav>
      </header>

      <UniversityIntroduction />

      <section
        id="ve-du-an"
        aria-labelledby="project-heading"
        className="grid scroll-mt-28 grid-cols-1 gap-8 border-t-2 border-primary pt-6 md:grid-cols-2 lg:scroll-mt-40"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="project-heading"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Mục tiêu của DLU Alumni
          </h2>
          <p className="font-serif text-2xl leading-snug text-foreground">
            {SITE.vision}
          </p>
        </div>
        <ul className="flex flex-col divide-y divide-border-strong border-y border-border-strong">
          {SITE.values.map((value) => (
            <li key={value.title} className="flex flex-col gap-1 py-4">
              <h3 className="font-serif text-lg font-medium text-foreground">
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="audience-heading"
        className="flex flex-col gap-6 pt-14"
      >
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Dành cho ai?
          </p>
          <h2
            id="audience-heading"
            className="font-heading text-2xl font-semibold sm:text-3xl"
          >
            Một cộng đồng, nhiều cách đồng hành.
          </h2>
        </div>
        <JoinBand />
      </section>

      <section
        aria-labelledby="explore-heading"
        className="flex flex-col gap-5 pt-14"
      >
        <h2
          id="explore-heading"
          className="font-heading text-2xl font-semibold sm:text-3xl"
        >
          Cùng kết nối mỗi ngày.
        </h2>
        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {SITE.communityLinks
            .filter((link) => link.href !== "/about")
            .map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-start justify-between gap-6 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold transition-colors group-hover:text-primary">
                      {link.label}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  <span aria-hidden="true" className="text-primary">
                    →
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section className="mt-16 flex flex-col items-start justify-between gap-6 rounded-xl border border-border-strong bg-card p-8 md:flex-row md:items-center">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="font-serif text-2xl text-foreground">
            Bạn muốn tham gia cộng đồng?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Cựu sinh viên, doanh nghiệp hay nhà hảo tâm đều có thể tham gia chia
            sẻ, tuyển dụng hoặc đóng góp cho Quỹ Khuyến học.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href="/register" />} nativeButton={false}>
            Tham gia mạng lưới
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button
            render={<Link href="/contact" />}
            nativeButton={false}
            variant="outline"
          >
            Liên hệ dự án
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
