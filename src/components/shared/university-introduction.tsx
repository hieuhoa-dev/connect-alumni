import Image from "next/image";
import { SITE } from "@/lib/site-config";

export const UniversityIntroduction = () => (
  <section
    id="ve-truong"
    aria-labelledby="university-heading"
    className="scroll-mt-28 border-t-2 border-primary pb-14 pt-8 lg:scroll-mt-40"
  >
    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Mái trường của cộng đồng
          </p>
          <h2
            id="university-heading"
            className="font-heading text-2xl font-semibold leading-tight sm:text-3xl"
          >
            {SITE.universityName}
          </h2>
        </div>
        {SITE.universityProfile.overview.map((paragraph) => (
          <p
            key={paragraph}
            className="text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            {paragraph}
          </p>
        ))}
      </div>
      <figure className="flex flex-col gap-3">
        <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-border">
          <Image
            src="/images/dlu-campus.jpg"
            alt="Khuôn viên Trường Đại học Đà Lạt giữa những hàng cây"
            fill
            sizes="(min-width: 1280px) 570px, (min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="text-xs leading-relaxed text-muted-foreground">
          Khuôn viên {SITE.universityName} · Ảnh từ cổng cựu sinh viên DLU
        </figcaption>
      </figure>
    </div>

    <div className="mt-9 flex flex-col gap-4">
      <h3 className="font-heading text-lg font-semibold">Dấu mốc phát triển</h3>
      <ol className="grid gap-6 border-y border-border py-6 md:grid-cols-3 md:gap-8">
        {SITE.universityProfile.milestones.map((milestone) => (
          <li key={milestone.year} className="flex items-start gap-5">
            <p className="font-heading text-2xl font-semibold tabular-nums text-primary">
              {milestone.year}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {milestone.text}
            </p>
          </li>
        ))}
      </ol>
    </div>

    <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
      Nội dung tổng hợp từ các website của Trường Đại học Đà Lạt · Đối chiếu
      ngày <time dateTime={SITE.universityProfile.verifiedAt}>13/10/2026</time>.
    </p>
  </section>
);
