import type { LandingData } from "@/lib/public-data";
import { EVENT_TYPE_LABEL, formatDateVi, formatTimeVi } from "@/lib/text";

export type LandingBannerSlide = {
  id: string;
  category: string;
  title: string;
  description: string;
  meta: string;
  href: string;
  imageUrl: string | null;
  action: string;
};

export const getLandingBannerSlides = (
  data: Pick<LandingData, "posts" | "events">,
): LandingBannerSlide[] => {
  const events: LandingBannerSlide[] = data.events.slice(0, 3).map((event) => ({
    id: `event-${event.id}`,
    category: "Sự kiện",
    title: event.title,
    description:
      event.format === "online"
        ? "Tham gia trực tuyến, gặp gỡ và trao đổi cùng cộng đồng DLU Alumni."
        : event.locationOrLink,
    meta: `${EVENT_TYPE_LABEL[event.type] ?? "Sự kiện"} · ${formatTimeVi(event.startTime)}, ${formatDateVi(event.startTime)}`,
    href: `/events/${event.id}`,
    imageUrl: event.coverImageUrl,
    action: "Xem sự kiện",
  }));
  const news: LandingBannerSlide[] = data.posts
    .filter((post) => post.kind === "news")
    .slice(0, 3)
    .map((post) => ({
      id: `news-${post.id}`,
      category: "Tin tức",
      title: post.title,
      description: post.excerpt,
      meta: post.publishedAt
        ? `${post.authorName} · ${formatDateVi(post.publishedAt)}`
        : post.authorName,
      href: post.href,
      imageUrl: post.coverImageUrl,
      action: "Đọc bản tin",
    }));

  // Giới thiệu chuyên mục khi chưa có bài, không tạo tin hoặc sự kiện giả.
  if (events.length === 0) {
    events.push({
      id: "events-intro",
      category: "Sự kiện",
      title: "Một cuộc hẹn, thêm nhiều kết nối.",
      description:
        "Gặp lại bạn bè, trao đổi với người đi trước và cùng tham gia các hoạt động của cộng đồng DLU Alumni.",
      meta: "Gặp gỡ · Chia sẻ · Đồng hành",
      href: "/events",
      imageUrl: null,
      action: "Khám phá lịch sự kiện",
    });
  }
  if (news.length === 0) {
    news.push({
      id: "news-intro",
      category: "Tin tức",
      title: "Dù ở đâu, vẫn gần nhau qua mỗi bản tin.",
      description:
        "Theo dõi thông báo, hoạt động và những dấu mốc mới của cộng đồng DLU Alumni.",
      meta: "Tin từ mái trường · Nhịp sống cộng đồng",
      href: "/news",
      imageUrl: null,
      action: "Ghé thăm bản tin",
    });
  }

  // Xen kẽ các chuyên mục để bản tin và sự kiện đều xuất hiện trong vòng chạy.
  return Array.from({ length: Math.max(events.length, news.length) }).flatMap(
    (_, index) => [events[index], news[index]].filter((slide) => slide != null),
  );
};
