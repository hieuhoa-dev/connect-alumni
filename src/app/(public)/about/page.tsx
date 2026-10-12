import { ArrowRight, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading, Tag } from "@/components/landing/landing-parts";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";
import { getInitials } from "@/lib/text";

export const metadata: Metadata = {
  title: "Giới thiệu · Cộng đồng CNTT Đại học Đà Lạt",
  description: `Kết nối các thế hệ ${SITE.facultyName}, ${SITE.universityName}. Thông tin Khoa, các cột mốc và Ban Liên lạc Cựu sinh viên.`,
};

const AboutPage = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="flex max-w-3xl flex-col gap-4 pb-12">
        <Tag tone="blue">Giới thiệu</Tag>
        <h1 className="font-serif text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          Mạng lưới Cựu sinh viên{" "}
          <span className="font-light italic text-foreground/80">
            {SITE.facultyName}
          </span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {SITE.mission}
        </p>
        <a
          href={SITE.universityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {SITE.universityName} <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="grid grid-cols-1 gap-8 border-t-2 border-foreground pt-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mục tiêu của Connect Alumni
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

      <section className="flex flex-col gap-6 pt-14">
        <SectionHeading
          icon={GraduationCap}
          eyebrow="Chặng đường"
          title="Các cột mốc"
        />
        <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border-strong bg-border-strong sm:grid-cols-2">
          {SITE.milestones.map((item) => (
            <li key={item.year} className="flex flex-col gap-2 bg-card p-5">
              <span className="font-mono text-2xl text-foreground">
                {item.year}
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-fit text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Xem thông tin từ Khoa <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="specializations-heading"
        className="flex flex-col gap-5 pt-14"
      >
        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Tìm hiểu về Khoa
          </p>
          <h2
            id="specializations-heading"
            className="font-serif text-2xl sm:text-3xl"
          >
            Các chuyên ngành đào tạo
          </h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {SITE.specializations.map((specialization) => (
            <li key={specialization.href}>
              <a
                href={specialization.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                {specialization.name}
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-label="Ban Liên lạc Cựu sinh viên"
        className="flex flex-col gap-6 pt-14"
      >
        <SectionHeading
          icon={GraduationCap}
          eyebrow="Cựu sinh viên"
          title="Ban Liên lạc Cựu sinh viên Khoa CNTT"
        />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Danh sách được Khoa công bố ngày {SITE.boardPublishedAt}.{" "}
          <a
            href={SITE.alumniBoardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Xem thông tin trên website Khoa <span aria-hidden="true">↗</span>
          </a>
        </p>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SITE.board.map((member) => (
            <li
              key={member.name}
              className="flex items-start gap-4 rounded-xl border border-border-strong bg-card p-5"
            >
              <span
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted font-serif text-lg text-foreground"
              >
                {getInitials(member.name.replace(/^(TS|ThS|PGS|GS)\.\s*/i, ""))}
              </span>
              <div className="flex flex-col gap-0.5">
                <h3 className="font-serif text-lg font-medium leading-snug text-foreground">
                  {member.name}
                </h3>
                <span className="text-sm text-foreground/80">
                  {member.title}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 flex flex-col items-start justify-between gap-6 rounded-xl border border-border-strong bg-card p-8 md:flex-row md:items-center">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="font-serif text-2xl text-foreground">
            Bạn muốn đồng hành cùng Khoa?
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
            Liên hệ Khoa
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
