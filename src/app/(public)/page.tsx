import * as React from "react";
import { getActiveJobPosts } from "@/actions/job-actions";
import { getPublishedEvents } from "@/actions/event-actions";
import { getPublishedExperiencePosts } from "@/actions/experience-actions";
import { getScholarshipCampaigns } from "@/actions/scholarship-actions";
import { BreakingTicker } from "@/components/landing/breaking-ticker";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { AnniversaryBand } from "@/components/landing/anniversary-band";
import { AcademicNewsPortal } from "@/components/landing/academic-news-portal";
import { NetworkStats } from "@/components/landing/network-stats";
import { ScholarshipTracker } from "@/components/landing/scholarship-tracker";
import { PartnerLogos } from "@/components/landing/partner-logos";
import { ContactSection } from "@/components/landing/contact-section";
import { CtaNewsletter } from "@/components/landing/cta-newsletter";

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
    <div className="w-full bg-background text-foreground overflow-x-hidden">
      {/* 1. Ticker tin mới trên cùng (pine-900) */}
      <BreakingTicker />

      {/* 2. Hero Carousel chính (Tự chạy 5s, Ken Burns, Play/Pause) */}
      <HeroCarousel />

      {/* 3. Dải mốc "30 năm 1996 - 2026" (bg-hero) */}
      <AnniversaryBand />

      {/* 4 & 5. Tin tức - Sự kiện (canvas) & Việc làm nổi bật (pine-50) & Cựu SV tiêu biểu (canvas) */}
      <AcademicNewsPortal
        events={events}
        posts={posts}
        jobs={jobs}
        scholarships={scholarships}
      />

      {/* 6. Số liệu mạng lưới DLU với Count-up (bg-photo-tint) */}
      <NetworkStats />

      {/* 7. Quỹ Khuyến Học DLU (blossom-50 -> canvas) */}
      <ScholarshipTracker campaign={featuredCampaign} />

      {/* 8. Marquee Đối tác chiến lược (Trắng) */}
      <PartnerLogos />

      {/* 9. Thông tin liên hệ Khoa CNTT & Bản đồ Google Maps Tòa nhà A7 */}
      <ContactSection />

      {/* 10. Bản tin / CTA cuối trang (bg-hero) */}
      <CtaNewsletter />
    </div>
  );
};

export default HomePage;
