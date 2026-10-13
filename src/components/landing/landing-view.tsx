import {
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  HeartHandshake,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { CommunityLinks } from "@/components/landing/community-links";
import { LandingBanner } from "@/components/landing/landing-banner";
import { getLandingBannerSlides } from "@/components/landing/landing-banner-data";
import {
  EmptyBlock,
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
import { Button } from "@/components/ui/button";
import type { LandingData } from "@/lib/public-data";

export const LandingView = ({
  data,
  search,
}: {
  data: LandingData;
  search?: string;
}) => {
  const [lead, ...others] = data.posts;
  const headlines = others.slice(0, 4);
  const stories = others.slice(4);
  const experiences = stories.filter((post) => post.kind === "experience");
  const newsStories = stories.filter((post) => post.kind === "news");

  return (
    <div className="landing-canvas">
      <div className="container mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <Masthead search={search} />

        {search ? (
          <section
            aria-labelledby="search-results-heading"
            className="py-8 sm:py-10"
          >
            <h2 id="search-results-heading" className="sr-only">
              Kết quả tìm kiếm
            </h2>
            {data.searchUnavailable && data.posts.length > 0 && (
              <output className="mb-6 block rounded-md border border-border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
                Một số nội dung chưa thể tải. Các bài đã tìm thấy hiển thị bên
                dưới; bạn có thể thử lại sau để xem đầy đủ kết quả.
              </output>
            )}
            {data.posts.length > 0 ? (
              <StoryGrid posts={data.posts} />
            ) : (
              <EmptyBlock
                icon={BookOpen}
                title={
                  data.searchUnavailable
                    ? "Chưa thể tải kết quả tìm kiếm"
                    : "Chưa tìm thấy bài phù hợp"
                }
                description={
                  data.searchUnavailable
                    ? "Vui lòng thử lại sau hoặc xóa từ khóa để quay lại trang chủ."
                    : "Thử từ khóa khác hoặc xóa từ khóa để khám phá các nội dung trên trang chủ."
                }
              />
            )}
          </section>
        ) : (
          <>
            <div className="pt-6 sm:pt-8">
              <LandingBanner slides={getLandingBannerSlides(data)} />
            </div>

            <LandingReveal className="py-7 sm:py-9">
              <section aria-labelledby="front-page-heading">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2
                    id="front-page-heading"
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary"
                  >
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-primary"
                    />
                    Tiêu điểm cộng đồng
                  </h2>
                  <Link
                    href="/news"
                    className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    Tất cả tin tức <span aria-hidden="true">↗</span>
                  </Link>
                </div>
                <div className="grid gap-7 lg:grid-cols-[1.65fr_1fr] lg:gap-8">
                  <LeadStory post={lead} />
                  <div className="flex flex-col gap-6 lg:border-l lg:border-border lg:pl-8">
                    <LatestHeadlines posts={headlines} />
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-accent p-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-accent-foreground">
                          Mỗi câu chuyện đều đáng sẻ chia.
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Gửi kinh nghiệm của bạn đến thế hệ tiếp theo.
                        </p>
                      </div>
                      <Button
                        render={<Link href="/student/experiences/new" />}
                        nativeButton={false}
                        variant="outline"
                        size="sm"
                      >
                        Viết bài
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </LandingReveal>

            {newsStories.length > 0 && (
              <LandingReveal className="pb-9">
                <section className="flex flex-col gap-5">
                  <SectionHeading
                    icon={BookOpen}
                    eyebrow="Tin từ mái trường"
                    title="Hoạt động & thông báo"
                    href="/news"
                  />
                  <StoryGrid posts={newsStories} />
                </section>
              </LandingReveal>
            )}

            <div className="grid gap-x-8 gap-y-10 lg:grid-cols-[1.65fr_1fr]">
              <div className="flex min-w-0 flex-col gap-9">
                <LandingReveal>
                  <section className="flex flex-col gap-5">
                    <SectionHeading
                      icon={BookOpen}
                      eyebrow="Người đi trước, chuyện hôm nay"
                      title="Chuyện cựu sinh viên"
                      href="/experiences"
                    />
                    {experiences.length > 0 ? (
                      <StoryGrid posts={experiences} />
                    ) : (
                      <div className="flex flex-col gap-3 border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-lg font-semibold leading-snug">
                            Có những điều chỉ người đi trước mới kể được.
                          </h3>
                          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                            Một công việc đầu tiên, một lựa chọn nghề nghiệp hay
                            một kỷ niệm ở Đà Lạt. Câu chuyện của bạn có thể giúp
                            ai đó vững tin hơn.
                          </p>
                        </div>
                        <Button
                          render={<Link href="/student/experiences/new" />}
                          nativeButton={false}
                          variant="outline"
                        >
                          Chia sẻ câu chuyện
                        </Button>
                      </div>
                    )}
                  </section>
                </LandingReveal>

                <LandingReveal>
                  <section className="flex flex-col gap-3">
                    <SectionHeading
                      icon={Calendar}
                      eyebrow="Hẹn gặp lại nhau"
                      title="Lịch sự kiện"
                      href="/events"
                      hrefLabel="Xem lịch"
                    />
                    <EventList events={data.events} />
                  </section>
                </LandingReveal>
              </div>

              <aside
                aria-label="Thông tin cộng đồng"
                className="flex min-w-0 flex-col gap-8 lg:border-l lg:border-border lg:pl-8"
              >
                {data.popular.length > 0 && (
                  <LandingReveal>
                    <section className="flex flex-col gap-3">
                      <SectionHeading
                        icon={TrendingUp}
                        eyebrow="Được quan tâm"
                        title="Đọc nhiều"
                      />
                      <PopularList posts={data.popular} />
                    </section>
                  </LandingReveal>
                )}
                <LandingReveal>
                  <section className="flex flex-col gap-3">
                    <SectionHeading
                      icon={Briefcase}
                      eyebrow="Bước tiếp cùng nhau"
                      title="Việc làm & thực tập"
                      href="/jobs"
                    />
                    <JobList jobs={data.jobs} />
                  </section>
                </LandingReveal>
                <LandingReveal>
                  <section className="flex flex-col gap-4">
                    <SectionHeading
                      icon={HeartHandshake}
                      eyebrow="Trao cơ hội học tập"
                      title="Quỹ Khuyến học"
                      href="/scholarships"
                    />
                    <FundCard campaign={data.campaign} />
                  </section>
                </LandingReveal>
              </aside>
            </div>

            <LandingReveal className="pt-10">
              <StatsStrip stats={data.stats} />
            </LandingReveal>

            <LandingReveal className="pt-10">
              <CommunityLinks />
            </LandingReveal>

            <LandingReveal className="pt-10">
              <section
                aria-labelledby="join-heading"
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      Một cộng đồng, nhiều cách đồng hành
                    </p>
                    <h2
                      id="join-heading"
                      className="text-2xl font-semibold tracking-tight sm:text-3xl"
                    >
                      Dù ở đâu, vẫn là người một nhà.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Gặp lại những người bạn, tìm một cơ hội mới hoặc giúp thế hệ
                    tiếp theo bắt đầu hành trình của mình.
                  </p>
                </div>
                <JoinBand />
              </section>
            </LandingReveal>

            {data.partners.length > 0 && (
              <LandingReveal className="pt-10">
                <section className="flex flex-col gap-5">
                  <SectionHeading
                    icon={Building2}
                    eyebrow="Đối tác cộng đồng"
                    title="Doanh nghiệp đồng hành"
                  />
                  <PartnerWall partners={data.partners} />
                </section>
              </LandingReveal>
            )}
          </>
        )}
      </div>
    </div>
  );
};
