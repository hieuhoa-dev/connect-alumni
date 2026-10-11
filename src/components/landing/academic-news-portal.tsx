"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Heart,
  Globe,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Briefcase,
  Layers,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DLULogo } from "@/components/shared/dlu-logo";
import {
  sampleDLUJobs,
  sampleDLUEvents,
  sampleDLUExperiences,
  sampleDLUScholarships,
} from "@/lib/dlu-sample-data";

interface AcademicNewsPortalProps {
  events?: any[];
  posts?: any[];
  jobs?: any[];
  scholarships?: any[];
}

export const AcademicNewsPortal = ({
  events = [],
  posts = [],
  jobs = [],
  scholarships = [],
}: AcademicNewsPortalProps) => {
  // 1. Dữ liệu Tin tức Cựu sinh viên Đại học Đà Lạt (3 bài cột trái - như hình 2)
  const newsList = React.useMemo(() => {
    const rawList = posts.length > 0 ? posts : sampleDLUExperiences;
    return [
      {
        id: "dlu-news-1",
        title: "CHƯƠNG TRÌNH ĐỊNH HƯỚNG NGHỀ NGHIỆP VÀ KẾT NỐI DOANH NGHIỆP TRƯỜNG ĐẠI HỌC ĐÀ LẠT",
        description: "Mạng lưới Cựu sinh viên phối hợp cùng Trường Đại học Đà Lạt tổ chức chuỗi sự kiện giao lưu, trang bị kỹ năng thực chiến cho sinh viên các khoa trước thềm tốt nghiệp.",
        date: "10/09/2026",
        imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
        href: "/experiences",
      },
      {
        id: "dlu-news-2",
        title: "BAN LIÊN LẠC MẠNG LƯỚI CỰU SINH VIÊN ĐẠI HỌC ĐÀ LẠT – CẦU NỐI GẮN KẾT CÁC THẾ HỆ",
        description: "Tốt nghiệp không phải là kết thúc hành trình, mà là sự tiếp nối một tình yêu sâu đậm với xứ sở ngàn hoa và mái trường Đại học Đà Lạt cổ kính, nên thơ.",
        date: "01/07/2026",
        imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
        href: "/experiences",
      },
      {
        id: "dlu-news-3",
        title: "NHIỆM VỤ VÀ TẦM NHÌN PHÁT TRIỂN CỦA MẠNG LƯỚI CỰU SINH VIÊN ĐẠI HỌC ĐÀ LẠT ĐẾN 2030",
        description: "Khẳng định truyền thống học thuật xuất sắc của DLU, hỗ trợ thế hệ đàn em về học bổng, việc làm và nâng tầm vị thế sinh viên Đà Lạt trên thị trường lao động toàn cầu.",
        date: "24/06/2026",
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
        href: "/experiences",
      },
    ];
  }, [posts]);

  // 2. Sự kiện tiêu điểm DLU (Cột phải - như hình 2)
  const leadEvent = React.useMemo(() => {
    if (events && events.length > 0) {
      const ev = events[0];
      return {
        id: ev.id,
        title: ev.title || "KẾT NỐI TRUYỀN THỐNG – TIẾP BƯỚC ƯỚC MƠ: DLU HOMECOMING",
        date: new Date(ev.startTime).toLocaleDateString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        location:
          ev.locationOrLink && ev.locationOrLink !== "undefined"
            ? ev.locationOrLink
            : "Hội trường Thư viện Trung tâm - Trường Đại học Đà Lạt",
        imageUrl:
          ev.coverImageUrl ||
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
        href: `/events/${ev.id}`,
      };
    }
    const sample = sampleDLUEvents[0];
    return {
      id: sample.id,
      title: sample.title,
      date: "08:30 - Ngày 20/11/2026",
      location: "Hội trường Thư viện Trung tâm - Trường Đại học Đà Lạt (01 Phù Đổng Thiên Vương, TP. Đà Lạt)",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
      href: "/events",
    };
  }, [events]);

  // 3. Gương mặt Cựu sinh viên tiêu biểu Đại học Đà Lạt (4 thẻ - như hình 3)
  const alumniSpotlights = [
    {
      id: "alumni-1",
      title: "HÀNH TRÌNH TỪ GIẢNG ĐƯỜNG ĐẠI HỌC ĐÀ LẠT ĐẾN GIÁM ĐỐC CÔNG NGHỆ TẠI TP.HCM",
      description: "Đà Lạt với những đồi thông thơ mộng và thư viện DLU yên bình đã rèn luyện cho tôi tính kiên trì, tự học. Bài học lớn nhất là tinh thần trách nhiệm và lòng say mê với nghề.",
      date: "02/06/2026",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
      href: "/experiences",
    },
    {
      id: "alumni-2",
      title: "GẶP GỠ CỰU SINH VIÊN DLU – TỔNG QUẢN LÝ TẬP ĐOÀN DU LỊCH & NGHỈ DƯỠNG",
      description: "Cựu sinh viên K35 đã trao tặng 20 suất học bổng tài trợ cho sinh viên ngành Du lịch & Dịch vụ, đồng thời ký kết tiếp nhận 50 thực tập sinh mỗi năm.",
      date: "21/10/2025",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      href: "/experiences",
    },
    {
      id: "alumni-3",
      title: "CÂU CHUYỆN VƯỢT NGHỊCH CẢNH CỦA CỰU SINH VIÊN SƯ PHẠM VÙNG CAO TÂY NGUYÊN",
      description: "Những năm tháng học tập dưới mái trường Đại học Đà Lạt đã tiếp thêm cho tôi nghị lực để mang con chữ và tri thức khoa học đến với các em học sinh vùng đồng bào thiểu số.",
      date: "02/10/2025",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      href: "/experiences",
    },
    {
      id: "alumni-4",
      title: "TỪ SINH VIÊN NÔNG HỌC ĐẠI HỌC ĐÀ LẠT ĐẾN CHỦ TRANG TRẠI HIGH-TECH",
      description: "Ứng dụng mô hình nông nghiệp thông minh và chuỗi cung ứng hữu cơ, cựu sinh viên K34 đã đưa nông sản chất lượng cao của Lâm Đồng vươn ra thị trường quốc tế.",
      date: "02/10/2025",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      href: "/experiences",
    },
  ];

  // 4. Trải nghiệm / Hoạt động Cựu sinh viên DLU (5 chuyên mục - như hình 4)
  const experienceCategories = [
    {
      id: "global",
      title: "Kết nối toàn cầu",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
      href: "/events",
    },
    {
      id: "community",
      title: "Hoạt động cộng đồng",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
      href: "/experiences",
    },
    {
      id: "training",
      title: "Đào tạo & Nghiên cứu",
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80",
      href: "/events",
    },
    {
      id: "giving",
      title: "Đóng góp & Tài trợ",
      imageUrl: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=600&q=80",
      href: "/scholarships",
    },
    {
      id: "benefits",
      title: "Lợi ích & Dịch vụ",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
      href: "/jobs",
    },
  ];

  return (
    <div className="space-y-12">
      {/* ─── BANNER CHÍNH: DLU REUNION (Hình 2 UEH Reunion của user) ────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative rounded-2xl overflow-hidden border border-[#1E4D2B]/20 bg-gradient-to-r from-[#14391E] via-[#1E4D2B] to-[#2E6B3F] text-white p-6 sm:p-10 shadow-sm">
          {/* Background image subtle overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80')",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-xs text-[#FDE68A]">
                <DLULogo size={20} />
                <span>Trường Đại học Đà Lạt · DLU Alumni</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                DLU REUNION 2026: NGÀY HỘI CỰU SINH VIÊN
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                HÀNH TRÌNH TRỞ VỀ MÁI NHÀ CHUNG ĐẦY CẢM XÚC — NƠI HỘI TỤ CÁC THẾ HỆ SINH VIÊN XỨ HOA
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                render={<Link href="/events" />}
                nativeButton={false}
                size="lg"
                className="bg-[#E67300] hover:bg-[#E67300]/90 text-white font-bold text-xs sm:text-sm h-10 px-5 uppercase shadow-sm"
              >
                Đăng ký tham gia
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
              <Button
                render={<Link href="/register" />}
                nativeButton={false}
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs sm:text-sm h-10 px-5"
              >
                Cập nhật thông tin Cựu SV
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KHỐI 1: TIN TỨC & SỰ KIỆN (Hình 2 HANU) ──────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: TIN TỨC (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Header có gạch xanh thông Đại học Đà Lạt */}
            <div className="flex items-center gap-2 border-b border-[#1E4D2B]/30 pb-2">
              <span className="w-1.5 h-5 bg-[#1E4D2B] rounded-xs inline-block" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#1E4D2B]">
                TIN TỨC
              </h2>
            </div>

            {/* Danh sách 3 bài tin tức */}
            <div className="space-y-4">
              {newsList.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 p-2 rounded-lg hover:bg-[#1E4D2B]/5 transition-colors group"
                >
                  {/* Ảnh thumbnail bên trái */}
                  <div className="sm:w-44 h-28 shrink-0 overflow-hidden rounded-md border border-border/80 bg-muted">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Nội dung bên phải */}
                  <div className="flex-1 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        {item.date}
                      </div>
                      <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 uppercase group-hover:text-[#1E4D2B] transition-colors mt-0.5">
                        <Link href={item.href}>{item.title}</Link>
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Link Xem thêm */}
            <div className="flex justify-end pt-1">
              <Link
                href="/experiences"
                className="text-xs italic text-foreground hover:text-[#1E4D2B] hover:underline transition-colors font-medium"
              >
                Xem thêm &rarr;
              </Link>
            </div>
          </div>

          {/* CỘT PHẢI: SỰ KIỆN (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Header có gạch xanh thông */}
            <div className="flex items-center gap-2 border-b border-[#1E4D2B]/30 pb-2">
              <span className="w-1.5 h-5 bg-[#1E4D2B] rounded-xs inline-block" />
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#1E4D2B]">
                SỰ KIỆN
              </h2>
            </div>

            {/* Card sự kiện tiêu điểm lớn */}
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden group hover:border-[#1E4D2B]/50 transition-colors">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <img
                  src={leadEvent.imageUrl}
                  alt={leadEvent.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                  loading="lazy"
                />
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                <h3 className="text-base font-bold text-foreground leading-snug uppercase group-hover:text-[#1E4D2B] transition-colors">
                  <Link href={leadEvent.href}>{leadEvent.title}</Link>
                </h3>

                <div className="space-y-1.5 text-xs text-muted-foreground font-sans">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-[#E67300] shrink-0" />
                    <span>Thời gian: {leadEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-[#E67300] shrink-0" />
                    <span className="truncate">Địa điểm: {leadEvent.location}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    render={<Link href={leadEvent.href} />}
                    nativeButton={false}
                    className="w-full text-xs font-semibold uppercase bg-[#1E4D2B] hover:bg-[#1E4D2B]/90 text-white h-9"
                  >
                    Xem chi tiết sự kiện
                  </Button>
                </div>
              </div>
            </div>

            {/* Link Xem thêm */}
            <div className="flex justify-end pt-1">
              <Link
                href="/events"
                className="text-xs italic text-foreground hover:text-[#1E4D2B] hover:underline transition-colors font-medium"
              >
                Xem thêm &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KHỐI 2: GƯƠNG MẶT CỰU SINH VIÊN (Hình 3) ────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 border-b border-[#1E4D2B]/30 pb-2 mb-6">
          <span className="w-1.5 h-5 bg-[#1E4D2B] rounded-xs inline-block" />
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#1E4D2B]">
            GƯƠNG MẶT CỰU SINH VIÊN ĐẠI HỌC ĐÀ LẠT
          </h2>
        </div>

        {/* 4 Thẻ ngang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {alumniSpotlights.map((alumni) => (
            <div
              key={alumni.id}
              className="rounded-xl border border-border/80 bg-card overflow-hidden hover:border-[#1E4D2B]/50 transition-colors flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img
                    src={alumni.imageUrl}
                    alt={alumni.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-xs font-bold text-foreground leading-snug line-clamp-2 uppercase group-hover:text-[#1E4D2B] transition-colors">
                    <Link href={alumni.href}>{alumni.title}</Link>
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                    {alumni.description}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-3 pt-1 flex justify-end">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {alumni.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Link Xem thêm */}
        <div className="flex justify-end pt-3">
          <Link
            href="/experiences"
            className="text-xs italic text-foreground hover:text-[#1E4D2B] hover:underline transition-colors font-medium"
          >
            Xem thêm &rarr;
          </Link>
        </div>
      </section>

      {/* ─── KHỐI 3: LỢI ÍCH CỰU SINH VIÊN (Hình 3) ───────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden border border-[#1E4D2B]/30 bg-zinc-900 text-white p-8 sm:p-12">
          {/* Ảnh nền mờ sinh viên ném mũ tốt nghiệp */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
              LỢI ÍCH CỰU SINH VIÊN ĐẠI HỌC ĐÀ LẠT
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Nắm bắt cơ hội giúp phát triển nghề nghiệp, mở rộng mối quan hệ với các cựu sinh viên thành đạt, tiếp cận mạng lưới tuyển dụng đối tác và chung tay góp phần vào lợi ích của cộng đồng Đại học Đà Lạt.
            </p>

            <div className="pt-2">
              <Button
                render={<Link href="/jobs" />}
                nativeButton={false}
                className="bg-[#E67300] hover:bg-[#E67300]/90 text-white font-semibold text-xs h-9 px-5 uppercase"
              >
                <Heart data-icon="inline-start" className="size-3.5 mr-1.5 fill-current" />
                Khám phá ngay
              </Button>
            </div>

            <p className="text-xs text-zinc-400 pt-2 leading-relaxed">
              Duy trì kết nối và tương tác mọi lúc, mọi nơi trên mọi thiết bị thông qua nền tảng <strong className="text-white">DLU Alumni</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ─── KHỐI 4: TRẢI NGHIỆM CỰU SINH VIÊN (Hình 4) ────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 border-b border-[#1E4D2B]/30 pb-2 mb-6">
          <span className="w-1.5 h-5 bg-[#1E4D2B] rounded-xs inline-block" />
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#1E4D2B]">
            TRẢI NGHIỆM CỰU SINH VIÊN ĐẠI HỌC ĐÀ LẠT
          </h2>
        </div>

        {/* 5 Thẻ hoạt động đối xứng */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {experienceCategories.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group rounded-xl border border-border/80 bg-card overflow-hidden hover:border-[#1E4D2B] hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="p-3 text-center bg-card">
                <span className="text-xs font-bold text-foreground group-hover:text-[#1E4D2B] transition-colors block">
                  {item.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── KHỐI 5: QUỸ HỌC BỔNG DLU & CƠ HỘI VIỆC LÀM ───────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Học bổng */}
          <div className="p-6 rounded-xl border border-[#1E4D2B]/20 bg-[#1E4D2B]/5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#1E4D2B]/10 text-[#1E4D2B] font-bold inline-block">
                QUỸ KHUYẾN HỌC ĐẠI HỌC ĐÀ LẠT
              </span>
              <h3 className="text-base font-bold text-foreground">
                Tiếp sức Tài năng & Trao học bổng vượt khó thường niên
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Đồng hành cùng các thế hệ sinh viên DLU vượt khó hiếu học và khen thưởng các đề tài nghiên cứu khoa học, khởi nghiệp tiềm năng.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                render={<Link href="/scholarships" />}
                nativeButton={false}
                size="sm"
                className="text-xs bg-[#1E4D2B] hover:bg-[#1E4D2B]/90 text-white"
              >
                Nộp hồ sơ xin học bổng
              </Button>
              <Button
                render={<Link href="/employer/scholarships/pledge" />}
                nativeButton={false}
                variant="outline"
                size="sm"
                className="text-xs border-[#1E4D2B]/30 hover:bg-[#1E4D2B]/10 text-[#1E4D2B]"
              >
                Đồng hành & Tài trợ
              </Button>
            </div>
          </div>

          {/* Card Việc làm */}
          <div className="p-6 rounded-xl border border-[#E67300]/20 bg-[#E67300]/5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#E67300]/15 text-[#D96B00] font-bold inline-block">
                CƠ HỘI NGHỀ NGHIỆP DLU
              </span>
              <h3 className="text-base font-bold text-foreground">
                Kênh Tuyển dụng Doanh nghiệp Đối tác & Cựu sinh viên
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hàng trăm vị trí thực tập, chuyên viên công nghệ, du lịch, sinh học và nông nghiệp cao được thẩm định từ các đối tác uy tín.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                render={<Link href="/jobs" />}
                nativeButton={false}
                size="sm"
                className="text-xs bg-[#E67300] hover:bg-[#E67300]/90 text-white"
              >
                Khám phá việc làm DLU
              </Button>
              <Button
                render={<Link href="/employer/jobs/new" />}
                nativeButton={false}
                variant="outline"
                size="sm"
                className="text-xs border-[#E67300]/30 hover:bg-[#E67300]/10 text-[#D96B00]"
              >
                Đăng tin tuyển dụng
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
