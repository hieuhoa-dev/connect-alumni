import * as React from "react";
import { getActiveJobPosts } from "@/actions/job-actions";
import { getPublishedEvents } from "@/actions/event-actions";
import { getPublishedExperiencePosts } from "@/actions/experience-actions";
import { getScholarshipCampaigns } from "@/actions/scholarship-actions";
import { getAlumniDirectory } from "@/server/dal/alumni";
import { getPublicHeroSlides } from "@/server/dal/hero";
import { getNetworkStats } from "@/server/dal/stats";
import { getVerifiedPartners } from "@/server/dal/partners";
import { getLiveTickerItems } from "@/server/dal/ticker";
import { getSiteSettings } from "@/server/dal/settings";
import { getRecentAlbumPhotos } from "@/server/dal/gallery";
import { BreakingTicker } from "@/components/landing/breaking-ticker";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { AnniversaryBand } from "@/components/landing/anniversary-band";
import { AcademicNewsPortal } from "@/components/landing/academic-news-portal";
import { NetworkStats } from "@/components/landing/network-stats";
import { ScholarshipTracker } from "@/components/landing/scholarship-tracker";
import { PartnerLogos } from "@/components/landing/partner-logos";
import { GalleryStrip } from "@/components/landing/gallery-strip";
import { ContactSection } from "@/components/landing/contact-section";

export const revalidate = 60; // ISR cache 60s

const HomePage = async () => {
  let heroSlidesList: any[] = [];
  let jobs: any[] = [];
  let events: any[] = [];
  let posts: any[] = [];
  let scholarships: any[] = [];
  let alumniRes: { alumni: any[] } = { alumni: [] };
  let statsList: any[] = [];
  let partnersList: any[] = [];
  let tickerList: any[] = [];
  let siteSettings: any = undefined;
  let galleryPhotos: any[] = [];

  try {
    const results = await Promise.all([
      getActiveJobPosts({ limit: 6 }),
      getPublishedEvents(),
      getPublishedExperiencePosts({ limit: 8 }),
      getScholarshipCampaigns(),
      getAlumniDirectory({ limit: 8 }),
      getPublicHeroSlides(),
      getNetworkStats(),
      getVerifiedPartners(),
      getLiveTickerItems(),
      getSiteSettings(),
      getRecentAlbumPhotos(8),
    ]);
    jobs = results[0];
    events = results[1];
    posts = results[2];
    scholarships = results[3];
    alumniRes = results[4];
    heroSlidesList = results[5];
    statsList = results[6];
    partnersList = results[7];
    tickerList = results[8];
    siteSettings = results[9];
    galleryPhotos = results[10];
  } catch (err) {
    console.error("[HomePage] Lỗi khi tải dữ liệu trang chủ từ CSDL:", err);
    throw err;
  }

  const featuredCampaign = scholarships.length > 0 ? scholarships[0] : null;

  return (
    <div className="w-full bg-background text-foreground overflow-x-hidden">
      {/* 1. Ticker tin mới trên cùng (pine-900) */}
      <BreakingTicker items={tickerList} />

      {/* 2. Hero Carousel chính (Tự chạy 6s, Ken Burns, Play/Pause) */}
      <HeroCarousel slides={heroSlidesList} />

      {/* 3. Dải mốc "50 năm 1976 - 2026" (bg-hero) */}
      <AnniversaryBand />

      {/* 4 & 5. Tin tức - Sự kiện (canvas) & Việc làm nổi bật (pine-50) & Cựu SV tiêu biểu (canvas) */}
      <AcademicNewsPortal
        events={events}
        posts={posts}
        jobs={jobs}
        scholarships={scholarships}
        spotlightAlumni={alumniRes?.alumni || []}
      />

      {/* 6. Số liệu mạng lưới DLU với Count-up (bg-photo-tint) */}
      <NetworkStats stats={statsList} />

      {/* 7. Quỹ Khuyến Học DLU (blossom-50 -> canvas) */}
      <ScholarshipTracker campaign={featuredCampaign} />

      {/* 8. Marquee Đối tác chiến lược (Trắng) */}
      <PartnerLogos partners={partnersList} />

      {/* 9. Thư viện ảnh Khoa CNTT (8 ảnh mới nhất) */}
      <GalleryStrip photos={galleryPhotos} />

      {/* 10. Thông tin liên hệ Khoa CNTT & Bản đồ Google Maps Tòa nhà A7 */}
      <ContactSection settings={siteSettings} />
    </div>
  );
};

export default HomePage;
