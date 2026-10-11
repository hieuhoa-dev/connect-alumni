import * as React from "react";
import { getActiveJobPosts } from "@/actions/job-actions";
import { getPublishedEvents } from "@/actions/event-actions";
import { getPublishedExperiencePosts } from "@/actions/experience-actions";
import { getScholarshipCampaigns } from "@/actions/scholarship-actions";
import { AcademicNewsPortal } from "@/components/landing/academic-news-portal";
import { BreakingTicker } from "@/components/landing/breaking-ticker";
import { ScholarshipTracker } from "@/components/landing/scholarship-tracker";

export const revalidate = 60; // ISR cache 60s

const HomePage = async () => {
  // Lấy dữ liệu thực tế từ Database thông qua Server Actions với fallback an toàn
  const [jobs, events, posts, scholarships] = await Promise.all([
    getActiveJobPosts({ limit: 6 }).catch(() => []),
    getPublishedEvents().catch(() => []),
    getPublishedExperiencePosts({ limit: 8 }).catch(() => []),
    getScholarshipCampaigns().catch(() => []),
  ]);

  const featuredCampaign = scholarships.length > 0 ? scholarships[0] : null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Ticker tin tức nóng */}
      <BreakingTicker />

      {/* Portal tin tức chính */}
      <AcademicNewsPortal
        events={events}
        posts={posts}
        jobs={jobs}
        scholarships={scholarships}
      />

      {/* Thanh theo dõi quỹ học bổng */}
      <ScholarshipTracker campaign={featuredCampaign} />
    </div>
  );
};

export default HomePage;
