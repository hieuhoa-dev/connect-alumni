import { LiveSearch } from "@/components/shared/live-search";

export const LandingHero = ({ search }: { search?: string }) => (
  <header className="flex flex-col gap-5 border-b-2 border-primary py-7 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
    <div className="flex flex-col gap-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary sm:text-[11px]">
        Bản tin cộng đồng · DLU Alumni
      </p>
      <h1 className="max-w-[36ch] font-heading text-2xl font-semibold leading-[1.35] tracking-[-0.025em] text-foreground sm:text-[1.875rem]">
        Chung một mái trường, trọn đời gắn bó.
      </h1>
      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
        Kết nối sinh viên và cựu sinh viên toàn Đại học Đà Lạt. Cùng chia sẻ
        kinh nghiệm, gặp gỡ và tìm cơ hội ở mọi khoa, ngành.
      </p>
    </div>
    <search
      aria-label="Tìm trong bản tin"
      className="w-full lg:w-80 lg:shrink-0"
    >
      <LiveSearch
        initialValue={search}
        label="Tìm bản tin và bài chia sẻ"
        placeholder="Tìm tin tức, câu chuyện, chủ đề..."
        className="[&_[data-slot=input-group]]:h-10"
      />
    </search>
  </header>
);
