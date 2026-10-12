import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";

const SECTIONS = [
  { href: "/news", label: "Tin từ Khoa" },
  { href: "/experiences", label: "Chuyện nghề" },
  { href: "/events", label: "Gặp gỡ & sự kiện" },
  { href: "/jobs", label: "Việc làm & thực tập" },
  { href: "/scholarships", label: "Quỹ Khuyến học" },
];

const CommunityIllustration = () => (
  <figure className="relative mx-auto flex w-full max-w-lg flex-col gap-5 lg:max-w-none">
    <div className="relative aspect-[6/5] overflow-hidden rounded-xl border border-border bg-card">
      <div className="absolute inset-x-6 top-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:inset-x-8 sm:top-7">
        <span>CNTT · Đại học Đà Lạt</span>
        <span aria-hidden="true">01 — 03</span>
      </div>
      <svg
        viewBox="0 0 480 400"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 size-full text-foreground"
      >
        <circle cx="272" cy="202" r="108" className="fill-accent/60" />
        <g
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M118 98C58 132 67 229 129 277M349 108c63 29 78 93 44 140M334 318c-39 34-112 28-161 4"
            strokeDasharray="3 7"
            opacity=".3"
          />
          <path d="m123 289 202-11 90 30-200 15-92-34Z" />
          <path d="m139 288 1-80 172-8 1 77M313 277l72 25v-83l-73-19" />
          <path d="m130 209 91-47 99 39-190 8ZM221 162v-25M216 137h29l-5 8h-19" />
          <path d="m156 220 24-1v17l-24 1v-17Zm43-2 24-1v17l-24 1v-17Zm43-2 24-1v17l-24 1v-17Zm43-2 13-.5v17l-13 .5v-17Z" />
          <path d="m156 249 24-1v17l-24 1v-17Zm86-2 24-1v17l-24 1v-17Zm43-2 13-.5v17l-13 .5v-17Z" />
          <path d="m197 285 1-34 26-1v33M210 251v32M331 218l16 5v18l-16-5v-18Zm28 9 14 4v18l-14-4v-18Zm-28 28 16 5v18l-16-5v-18Zm28 9 14 4v18l-14-4v-18Z" />
          <path
            d="m107 307 72 26 232-18M106 310l-13 2M421 310l13 4"
            opacity=".4"
          />
          <path d="M107 262v36m0-70c-16 0-24 20-20 31 3 9 12 12 20 9 9 7 22-2 22-13 0-16-8-27-22-27ZM404 264v35m0-65c-10-1-17 11-16 21 1 9 9 11 16 9 10 4 18-5 16-15-2-9-7-15-16-15Z" />
          <circle cx="125" cy="107" r="19" className="fill-card" />
          <circle cx="125" cy="102" r="5" />
          <path d="M116 117c1-10 17-10 18 0" />
          <circle cx="351" cy="116" r="19" className="fill-card" />
          <path d="m339 111 12-5 12 5-12 5-12-5Zm5 3v6c4 4 10 4 14 0v-6m5-3v10" />
          <circle cx="324" cy="326" r="19" className="fill-card" />
          <path d="M313 319h22v16h-22v-16Zm6 0v-4h10v4m-16 7h22m-13-2v4h4v-4" />
          <path
            d="m173 110 8 0m-4-4v8m126 36h8m-4-4v8M73 213h6m-3-3v6"
            opacity=".4"
          />
        </g>
      </svg>
      <div className="absolute left-[8%] top-[34%] rounded-md border border-border bg-card px-3 py-2 text-xs font-medium">
        Sinh viên
      </div>
      <div className="absolute right-[9%] top-[19%] rounded-md border border-border bg-card px-3 py-2 text-xs font-medium">
        Cựu sinh viên
      </div>
      <div className="absolute bottom-[8%] right-[8%] rounded-md border border-border bg-card px-3 py-2 text-xs font-medium">
        Doanh nghiệp
      </div>
    </div>
    <figcaption className="flex items-center justify-between gap-4 px-1 text-xs text-muted-foreground">
      <span>Cùng một điểm xuất phát. Nhiều hướng đi mới.</span>
      <span aria-hidden="true" className="font-serif text-xl">
        ↗
      </span>
    </figcaption>
  </figure>
);

export const LandingHero = () => (
  <header className="pt-10 sm:pt-16 lg:pt-20">
    <div className="grid items-center gap-10 pb-12 sm:gap-12 sm:pb-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pb-20">
      <div className="flex flex-col items-start gap-7">
        <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
          <span aria-hidden="true" className="h-px w-8 bg-foreground/50" />
          {SITE.facultyShortName}
        </p>
        <h1 className="max-w-[13ch] font-serif text-[2.75rem] font-medium leading-[1.06] tracking-[-0.035em] text-foreground sm:text-6xl lg:text-[4.5rem]">
          Từ giảng đường,
          <br />
          <em className="font-normal">cùng bước xa hơn.</em>
        </h1>
        <p className="max-w-[46ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
          Giữ kết nối với Khoa Công nghệ Thông tin, Trường Đại học Đà Lạt. Học
          hỏi từ người đi trước, tìm cơ hội nghề nghiệp và cùng đồng hành với
          những thế hệ tiếp theo.
        </p>
        <div className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row">
          <Button
            render={<Link href="/register" />}
            nativeButton={false}
            size="lg"
            className="h-11 px-5"
          >
            Tham gia mạng lưới
            <span aria-hidden="true">↗</span>
          </Button>
          <Button
            render={<Link href="/jobs" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="h-11 px-5"
          >
            Khám phá việc làm
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Chia sẻ kinh nghiệm · Gặp gỡ cộng đồng · Đồng hành cùng thế hệ mới
        </p>
      </div>
      <CommunityIllustration />
    </div>
    <nav
      aria-label="Khám phá chuyên mục"
      className="grid grid-cols-2 border-y border-border sm:grid-cols-3 lg:grid-cols-5"
    >
      {SECTIONS.map((section, index) => (
        <Link
          key={section.href}
          href={section.href}
          className="group flex items-center justify-between gap-3 px-3 py-4 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-4 sm:py-5 sm:text-sm"
        >
          <span className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-muted-foreground">
              0{index + 1}
            </span>
            {section.label}
          </span>
          <span
            aria-hidden="true"
            className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
          >
            ↗
          </span>
        </Link>
      ))}
    </nav>
  </header>
);
