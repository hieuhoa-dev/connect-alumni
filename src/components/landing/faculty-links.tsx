import { SITE } from "@/lib/site-config";

export const FacultyLinks = () => (
  <section
    aria-labelledby="faculty-links-heading"
    className="border-t border-border pt-8"
  >
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
      <div className="flex max-w-lg flex-col gap-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {SITE.universityName}
        </p>
        <h2
          id="faculty-links-heading"
          className="font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl"
        >
          Cùng một mái trường,
          <br />
          nhiều thế hệ kết nối.
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Khoa Công nghệ Thông tin được thành lập năm {SITE.founded}. Tại lễ kỷ
          niệm 20 năm vào ngày 14/10/2023, Khoa ra mắt Ban liên lạc Hội cựu sinh
          viên, tiếp nối sự đồng hành giữa các thế hệ.
        </p>
        <a
          href={SITE.milestones[1].sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-xs text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
        >
          Đọc câu chuyện trên website Khoa <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SITE.officialLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
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
                ↗
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {link.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  </section>
);
