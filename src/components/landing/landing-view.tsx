import {
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  HeartHandshake,
  TrendingUp,
  Users,
} from "lucide-react";
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
import type { LandingData } from "@/lib/public-data";

export const LandingView = ({ data }: { data: LandingData }) => {
  const [lead, ...others] = data.posts;
  const headlines = others.slice(0, 4);
  const stories = others.slice(4, 7);
  return (
    <div className="container mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <Masthead />
      <section
        aria-label="Tin chính"
        className="grid grid-cols-1 gap-x-10 gap-y-10 py-8 lg:grid-cols-12"
      >
        <div className="lg:col-span-8">
          <LeadStory post={lead} />
        </div>
        <div className="lg:col-span-4 lg:border-l lg:border-border-strong lg:pl-8">
          <LatestHeadlines posts={headlines} />
        </div>
      </section>
      <StatsStrip stats={data.stats} />
      <div className="grid grid-cols-1 gap-x-10 gap-y-14 pt-14 lg:grid-cols-12">
        <div className="flex flex-col gap-14 lg:col-span-8">
          {stories.length > 0 && (
            <section className="flex flex-col gap-6">
              <SectionHeading
                icon={BookOpen}
                eyebrow="Góc chia sẻ"
                title="Câu chuyện từ cựu sinh viên"
                href="/experiences"
              />
              <StoryGrid posts={stories} />
            </section>
          )}
          <section className="flex flex-col gap-2">
            <SectionHeading
              icon={Calendar}
              eyebrow="Talkshow và hội thảo"
              title="Sự kiện sắp diễn ra"
              href="/events"
              hrefLabel="Toàn bộ lịch"
            />
            <EventList events={data.events} />
          </section>
        </div>
        <aside className="flex flex-col gap-12 lg:col-span-4 lg:border-l lg:border-border-strong lg:pl-8">
          <section className="flex flex-col gap-3">
            <SectionHeading
              icon={Briefcase}
              eyebrow="Cơ hội nghề nghiệp"
              title="Tuyển dụng mới"
              href="/jobs"
            />
            <JobList jobs={data.jobs} />
          </section>
          <section className="flex flex-col gap-4">
            <SectionHeading
              icon={HeartHandshake}
              eyebrow="Quỹ Khuyến học"
              title="Tiến độ gây quỹ"
            />
            <FundCard campaign={data.campaign} />
          </section>
          {data.popular.length > 0 && (
            <section className="flex flex-col gap-3">
              <SectionHeading
                icon={TrendingUp}
                eyebrow="Đọc nhiều"
                title="Xem nhiều nhất"
              />
              <PopularList posts={data.popular} />
            </section>
          )}
        </aside>
      </div>
      {data.partners.length > 0 && (
        <section className="flex flex-col gap-6 pt-16">
          <SectionHeading
            icon={Building2}
            eyebrow="Đối tác"
            title="Doanh nghiệp đồng hành cùng Khoa"
          />
          <PartnerWall partners={data.partners} />
        </section>
      )}
      <section className="flex flex-col gap-6 pt-16">
        <SectionHeading
          icon={Users}
          eyebrow="Tham gia"
          title="Bạn tham gia mạng lưới với vai trò nào?"
        />
        <JoinBand />
      </section>
    </div>
  );
};
