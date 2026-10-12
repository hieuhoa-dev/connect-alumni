import {
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  HeartHandshake,
  TrendingUp,
} from "lucide-react";
import { FacultyLinks } from "@/components/landing/faculty-links";
import {
  EventList,
  FundCard,
  JobList,
  JoinBand,
  LatestHeadlines,
  LeadStory,
  Masthead,
  PartnerWall,
  PopularList,
  SectionHeading,
  StatsStrip,
  StoryGrid,
} from "@/components/landing/landing-parts";
import { LandingReveal } from "@/components/landing/landing-reveal";
import type { LandingData } from "@/lib/public-data";

export const LandingView = ({ data }: { data: LandingData }) => {
  // Chia bài viết: 1 tin chính, 4 tin mới ở cột phải, phần còn lại thành lưới thẻ.
  const [lead, ...others] = data.posts;
  const headlines = others.slice(0, 4);
  const stories = others.slice(4, 7);

  return (
    <div className="landing-canvas">
      <div className="container mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Masthead />

        <LandingReveal className="py-12 sm:py-16 lg:py-20">
          <section
            aria-labelledby="join-heading"
            className="flex flex-col gap-7"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Mỗi vai trò, một cách đồng hành
                </p>
                <h2
                  id="join-heading"
                  className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl"
                >
                  Bắt đầu từ điều bạn cần.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Tìm cơ hội cho mình, chia sẻ trải nghiệm hoặc kết nối với những
                tài năng mới.
              </p>
            </div>
            <JoinBand />
          </section>
        </LandingReveal>

        <LandingReveal>
          <StatsStrip stats={data.stats} />
        </LandingReveal>

        <LandingReveal className="pt-12 sm:pt-16">
          <FacultyLinks />
        </LandingReveal>

        {/* ─── TIN CHÍNH ──────────────────────────────────────────────────── */}
        <LandingReveal className="pt-16 sm:pt-20">
          <section
            aria-label="Bản tin cộng đồng"
            className="flex flex-col gap-8"
          >
            <SectionHeading
              icon={BookOpen}
              eyebrow="Bản tin cộng đồng"
              title="Những câu chuyện đang tiếp nối"
              href="/news"
            />
            <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <LeadStory post={lead} />
              </div>
              <div className="lg:col-span-4 lg:border-l lg:border-border-strong lg:pl-8">
                <LatestHeadlines posts={headlines} />
              </div>
            </div>
          </section>
        </LandingReveal>

        {/* ─── NỘI DUNG CHÍNH + SIDEBAR ───────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-14 pt-16 sm:pt-20 lg:grid-cols-12">
          <div className="flex flex-col gap-14 lg:col-span-8">
            {stories.length > 0 && (
              <LandingReveal>
                <section className="flex flex-col gap-6">
                  <SectionHeading
                    icon={BookOpen}
                    eyebrow="Góc nhìn & trải nghiệm"
                    title="Thêm những điều để đọc"
                  />
                  <StoryGrid posts={stories} />
                </section>
              </LandingReveal>
            )}

            <LandingReveal>
              <section className="flex flex-col gap-3">
                <SectionHeading
                  icon={Calendar}
                  eyebrow="Talkshow và hội thảo"
                  title="Sự kiện sắp diễn ra"
                  href="/events"
                  hrefLabel="Toàn bộ lịch"
                />
                <EventList events={data.events} />
              </section>
            </LandingReveal>
          </div>

          <aside className="flex flex-col gap-12 lg:col-span-4 lg:border-l lg:border-border-strong lg:pl-8">
            <LandingReveal>
              <section className="flex flex-col gap-3">
                <SectionHeading
                  icon={Briefcase}
                  eyebrow="Cơ hội nghề nghiệp"
                  title="Tuyển dụng mới"
                  href="/jobs"
                />
                <JobList jobs={data.jobs} />
              </section>
            </LandingReveal>

            <LandingReveal>
              <section className="flex flex-col gap-4">
                <SectionHeading
                  icon={HeartHandshake}
                  eyebrow="Quỹ Khuyến học"
                  title="Tiến độ gây quỹ"
                  href="/scholarships"
                  hrefLabel="Các chiến dịch"
                />
                <FundCard campaign={data.campaign} />
              </section>
            </LandingReveal>

            {data.popular.length > 0 && (
              <LandingReveal>
                <section className="flex flex-col gap-3">
                  <SectionHeading
                    icon={TrendingUp}
                    eyebrow="Được quan tâm"
                    title="Cộng đồng đang đọc"
                  />
                  <PopularList posts={data.popular} />
                </section>
              </LandingReveal>
            )}
          </aside>
        </div>

        {/* ─── ĐỐI TÁC ────────────────────────────────────────────────────── */}
        {data.partners.length > 0 && (
          <LandingReveal className="pt-16 sm:pt-20">
            <section className="flex flex-col gap-6">
              <SectionHeading
                icon={Building2}
                eyebrow="Đối tác"
                title="Doanh nghiệp đồng hành cùng Khoa"
              />
              <PartnerWall partners={data.partners} />
            </section>
          </LandingReveal>
        )}
      </div>
    </div>
  );
};
