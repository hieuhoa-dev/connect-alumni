"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Briefcase,
  BookOpen,
  HeartHandshake,
  ArrowRight,
  Clock,
  Building2,
  Tag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

type NewsTab = "all" | "events" | "jobs" | "experiences" | "scholarships";

interface NewsItem {
  id: string;
  category: "event" | "job" | "experience" | "scholarship";
  categoryLabel: string;
  categoryColor: "blue" | "green" | "red" | "yellow";
  title: string;
  description: string;
  date: string;
  authorOrSource: string;
  href: string;
  imageUrl?: string;
  extraMeta?: string;
}

interface NewsFeedSectionProps {
  events?: any[];
  jobs?: any[];
  posts?: any[];
  scholarships?: any[];
}

export const NewsFeedSection = ({
  events = [],
  jobs = [],
  posts = [],
  scholarships = [],
}: NewsFeedSectionProps) => {
  const [activeTab, setActiveTab] = React.useState<NewsTab>("all");

  // Tổng hợp dữ liệu thành danh sách tin tức chuẩn hóa
  const allNewsItems = React.useMemo<NewsItem[]>(() => {
    const list: NewsItem[] = [];

    // 1. Thêm Sự kiện
    events.forEach((ev) => {
      list.push({
        id: `ev-${ev.id}`,
        category: "event",
        categoryLabel: "SỰ KIỆN & TALKSHOW",
        categoryColor: "blue",
        title: ev.title,
        description: ev.description || "Chương trình tọa đàm và kết nối cựu sinh viên Khoa CNTT.",
        date: new Date(ev.startTime).toLocaleDateString("vi-VN"),
        authorOrSource: ev.locationOrLink || "Khoa CNTT",
        href: `/events/${ev.id}`,
        imageUrl: ev.coverImageUrl || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
        extraMeta: `${ev.registrations?.length || 0} lượt đăng ký`,
      });
    });

    // 2. Thêm Việc làm
    jobs.forEach((j) => {
      list.push({
        id: `jb-${j.id}`,
        category: "job",
        categoryLabel: "CƠ HỘI NGHỀ NGHIỆP",
        categoryColor: "green",
        title: `${j.title} — ${j.company?.name || "Đối tác Khoa"}`,
        description: j.description || "Cơ hội tuyển dụng chính thức được xác thực bởi Khoa CNTT.",
        date: new Date(j.createdAt || Date.now()).toLocaleDateString("vi-VN"),
        authorOrSource: j.company?.name || "Doanh nghiệp đối tác",
        href: `/jobs/${j.id}`,
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
        extraMeta: j.salaryRange || "Lương thỏa thuận",
      });
    });

    // 3. Thêm Bài viết kinh nghiệm
    posts.forEach((p) => {
      list.push({
        id: `ex-${p.id}`,
        category: "experience",
        categoryLabel: "CHIA SẺ KINH NGHIỆM",
        categoryColor: "yellow",
        title: p.title,
        description: p.content?.slice(0, 140) + "..." || "Góc nhìn thực tế từ cựu sinh viên trong ngành.",
        date: new Date(p.publishedAt || p.createdAt || Date.now()).toLocaleDateString("vi-VN"),
        authorOrSource: p.author?.profile?.fullName || p.author?.name || "Cựu SV Khoa",
        href: `/experiences/${p.id}`,
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
        extraMeta: p.tags?.slice(0, 2).map((t: string) => `#${t}`).join(" ") || "",
      });
    });

    // 4. Thêm Học bổng
    scholarships.forEach((s) => {
      list.push({
        id: `sc-${s.id}`,
        category: "scholarship",
        categoryLabel: "QUỸ KHUYẾN HỌC",
        categoryColor: "red",
        title: s.title,
        description: s.description || "Chương trình học bổng đồng hành cùng thế hệ sinh viên tương lai.",
        date: new Date(s.createdAt || Date.now()).toLocaleDateString("vi-VN"),
        authorOrSource: "Hội Cựu Sinh Viên & Doanh Nghiệp",
        href: `/scholarships/${s.id}`,
        imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
        extraMeta: `Mục tiêu: ${Number(s.targetAmount).toLocaleString("vi-VN")} đ`,
      });
    });

    // Nếu rỗng, fallback sang danh sách tin mẫu để giao diện luôn đầy đặn
    if (list.length === 0) {
      return [
        {
          id: "fb-1",
          category: "event",
          categoryLabel: "SỰ KIỆN & TALKSHOW",
          categoryColor: "blue",
          title: "Hội thảo Công nghệ: Xu hướng Generative AI và Cơ hội Việc làm cho Kỹ sư trẻ",
          description: "Gặp gỡ 3 cựu sinh viên đang làm việc tại Singapore và Mỹ để cùng thảo luận về tác động của LLMs đến ngành công nghệ phần mềm.",
          date: "15/10/2026",
          authorOrSource: "Ban liên lạc Cựu SV Quốc tế",
          href: "/events",
          imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
          extraMeta: "Trực tuyến qua Zoom",
        },
        {
          id: "fb-2",
          category: "job",
          categoryLabel: "CƠ HỘI NGHỀ NGHIỆP",
          categoryColor: "green",
          title: "Chương trình Fresher Software Engineer 2026 — FPT Software & VNG",
          description: "Chương trình tuyển dụng quy mô lớn dành riêng cho sinh viên năm cuối và cựu sinh viên mới tốt nghiệp Khoa CNTT.",
          date: "12/10/2026",
          authorOrSource: "FPT Software & VNG",
          href: "/jobs",
          imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
          extraMeta: "Lương 18M - 28M đ",
        },
        {
          id: "fb-3",
          category: "experience",
          categoryLabel: "CHIA SẺ KINH NGHIỆM",
          categoryColor: "yellow",
          title: "Từ sinh viên học lại môn Cấu trúc dữ liệu đến Lead Architect tại Viettel",
          description: "Bài chia sẻ truyền cảm hứng của cựu sinh viên K14 về hành trình vượt qua khủng hoảng và định hình tư duy lập trình chuyên nghiệp.",
          date: "10/10/2026",
          authorOrSource: "Nguyễn Tuấn Anh (Alumni K14)",
          href: "/experiences",
          imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
          extraMeta: "#KinhNghiem #CareerPath",
        },
        {
          id: "fb-4",
          category: "scholarship",
          categoryLabel: "QUỸ KHUYẾN HỌC",
          categoryColor: "red",
          title: "Phát động Quỹ Học Bổng 'Tiếp Bước Kỹ Sư CNTT Tương Lai' Niên khóa 2026",
          description: "Mục tiêu huy động 500 triệu đồng để trao tặng 50 suất học bổng cho sinh viên có hoàn cảnh khó khăn đạt thành tích học tập tốt.",
          date: "08/10/2026",
          authorOrSource: "Ban liên lạc Cựu SV Khoa",
          href: "/scholarships",
          imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
          extraMeta: "50 Suất học bổng",
        },
      ];
    }

    return list;
  }, [events, jobs, posts, scholarships]);

  // Lọc theo Tab đang chọn
  const filteredItems = React.useMemo(() => {
    if (activeTab === "all") return allNewsItems;
    if (activeTab === "events") return allNewsItems.filter((i) => i.category === "event");
    if (activeTab === "jobs") return allNewsItems.filter((i) => i.category === "job");
    if (activeTab === "experiences") return allNewsItems.filter((i) => i.category === "experience");
    if (activeTab === "scholarships") return allNewsItems.filter((i) => i.category === "scholarship");
    return allNewsItems;
  }, [activeTab, allNewsItems]);

  const tabsConfig = [
    { id: "all" as NewsTab, label: "Tất cả tin tức", count: allNewsItems.length },
    {
      id: "events" as NewsTab,
      label: "Sự kiện & Talkshow",
      count: allNewsItems.filter((i) => i.category === "event").length,
    },
    {
      id: "jobs" as NewsTab,
      label: "Tuyển dụng",
      count: allNewsItems.filter((i) => i.category === "job").length,
    },
    {
      id: "experiences" as NewsTab,
      label: "Chia sẻ kinh nghiệm",
      count: allNewsItems.filter((i) => i.category === "experience").length,
    },
    {
      id: "scholarships" as NewsTab,
      label: "Quỹ Khuyến học",
      count: allNewsItems.filter((i) => i.category === "scholarship").length,
    },
  ];

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border/80 pb-4 mb-6">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            BẢN TIN HOẠT ĐỘNG & THỜI SỰ
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Bản Tin Mạng Lưới Cựu Sinh Viên
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Cập nhật liên tục tin tức, cơ hội thực tập, talkshow và các hoạt động kết nối
          </p>
        </div>

        {/* View all link */}
        <Link
          href="/events"
          className="text-xs font-mono font-medium text-foreground hover:underline inline-flex items-center gap-1"
        >
          <span>Xem kho tin tức lưu trữ</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Tabs Navigation (Minimalist Editorial Style) */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {tabsConfig.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-3.5 py-1.5 text-xs font-medium rounded-md border transition-all duration-200 cursor-pointer flex items-center gap-2",
              activeTab === t.id
                ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                : "bg-background text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground",
            )}
          >
            <span>{t.label}</span>
            <span
              className={cn(
                "text-[10px] font-mono px-1.5 py-0.2 rounded",
                activeTab === t.id
                  ? "bg-background/20 text-background"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* News Grid (Editorial Newspaper Format) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.slice(0, 6).map((item) => (
          <article
            key={item.id}
            className="flex flex-col justify-between rounded-xl border border-border/80 bg-card overflow-hidden hover:border-foreground/30 transition-colors group"
          >
            <div>
              {/* Image thumbnail with ratio */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded border",
                      item.categoryColor === "blue" &&
                        "bg-[#E1F3FE] text-[#1F6C9F] border-[#BFDFFA]/60",
                      item.categoryColor === "green" &&
                        "bg-[#EDF3EC] text-[#346538] border-[#CDE3CB]/60",
                      item.categoryColor === "yellow" &&
                        "bg-[#FBF3DB] text-[#956400] border-[#EEDB9F]/60",
                      item.categoryColor === "red" &&
                        "bg-[#FDEBEC] text-[#9F2F2D] border-[#F7CDCE]/60",
                    )}
                  >
                    {item.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {item.date}
                  </span>
                  {item.extraMeta && (
                    <span className="text-foreground font-medium truncate max-w-[130px]">
                      {item.extraMeta}
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  <Link href={item.href}>{item.title}</Link>
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Footer with author & action link */}
            <div className="px-4 sm:px-5 py-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
              <span className="truncate max-w-[170px] text-[11px] font-medium text-foreground">
                {item.authorOrSource}
              </span>
              <Link
                href={item.href}
                className="text-xs font-mono font-semibold text-foreground hover:underline inline-flex items-center gap-0.5 shrink-0"
              >
                <span>Xem chi tiết</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
