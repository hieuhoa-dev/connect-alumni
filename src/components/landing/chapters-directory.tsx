"use client";

import * as React from "react";
import Link from "next/link";
import { Users, MapPin, Mail, ChevronRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Chapter {
  id: string;
  name: string;
  type: "cohort" | "region";
  leader: string;
  membersCount: number;
  location: string;
  email: string;
}

const chaptersData: Chapter[] = [
  {
    id: "k15",
    name: "Ban Liên Lạc Cựu Sinh Viên Khóa K15",
    type: "cohort",
    leader: "Anh Trần Hoàng Nam (CTO Base.vn)",
    membersCount: 280,
    location: "TP. Hồ Chí Minh",
    email: "bll.k15@it.edu.vn",
  },
  {
    id: "k16",
    name: "Ban Liên Lạc Cựu Sinh Viên Khóa K16",
    type: "cohort",
    leader: "Chị Lê Phương Thảo (Engineering Lead, Grab)",
    membersCount: 310,
    location: "TP. Hồ Chí Minh & Singapore",
    email: "bll.k16@it.edu.vn",
  },
  {
    id: "k17",
    name: "Ban Liên Lạc Cựu Sinh Viên Khóa K17",
    type: "cohort",
    leader: "Anh Vũ Đình Trọng (Tech Lead, VNG)",
    membersCount: 345,
    location: "TP. Hồ Chí Minh",
    email: "bll.k17@it.edu.vn",
  },
  {
    id: "k18",
    name: "Ban Liên Lạc Cựu Sinh Viên Khóa K18",
    type: "cohort",
    leader: "Anh Nguyễn Quang Huy (Co-founder TechStartup)",
    membersCount: 390,
    location: "Hà Nội & TP.HCM",
    email: "bll.k18@it.edu.vn",
  },
  {
    id: "hanoi",
    name: "Chi Hội Cựu Sinh Viên Khu Vực Phía Bắc",
    type: "region",
    leader: "Anh Phạm Đức Toàn (Viettel Group)",
    membersCount: 220,
    location: "Hà Nội",
    email: "alumni.hanoi@it.edu.vn",
  },
  {
    id: "global",
    name: "Chi Hội Cựu Sinh Viên Quốc Tế (Global Chapter)",
    type: "region",
    leader: "Anh Đặng Gia Bảo (Staff Engineer, Silicon Valley)",
    membersCount: 160,
    location: "Mỹ, Nhật Bản, Singapore, Châu Âu",
    email: "alumni.global@it.edu.vn",
  },
];

export const ChaptersDirectory = () => {
  const [filter, setFilter] = React.useState<"all" | "cohort" | "region">("all");

  const filteredChapters = React.useMemo(() => {
    if (filter === "all") return chaptersData;
    return chaptersData.filter((c) => c.type === filter);
  }, [filter]);

  return (
    <section id="chapters" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border/80 pb-4 mb-6">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            MẠNG LƯỚI TỔ CHỨC
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Ban Liên Lạc Các Niên Khóa & Chi Hội Vùng Miền
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tra cứu đầu mối kết nối cựu sinh viên theo từng khóa đào tạo và khu vực địa lý
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border/70 bg-card text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === "all"
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFilter("cohort")}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === "cohort"
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Theo Niên Khóa
          </button>
          <button
            type="button"
            onClick={() => setFilter("region")}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === "region"
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Chi Hội Vùng Miền
          </button>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredChapters.map((chapter) => (
          <div
            key={chapter.id}
            className="rounded-xl border border-border/80 bg-card p-5 space-y-3 hover:border-foreground/30 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                  {chapter.type === "cohort" ? "Niên khóa" : "Chi hội vùng miền"}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                  <Users className="size-3" />
                  {chapter.membersCount} Cựu SV
                </span>
              </div>

              <h3 className="font-serif text-base font-bold text-foreground leading-snug">
                {chapter.name}
              </h3>

              <div className="space-y-1.5 pt-1 text-xs text-muted-foreground font-sans">
                <div className="flex items-center gap-2">
                  <UserCheck className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-foreground font-medium truncate">
                    Trưởng ban: {chapter.leader}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{chapter.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="font-mono text-[11px] truncate">
                    {chapter.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50">
              <a
                href={`mailto:${chapter.email}`}
                className="text-xs font-mono font-medium text-foreground hover:underline inline-flex items-center justify-between w-full"
              >
                <span>Liên hệ Ban Liên Lạc</span>
                <ChevronRight className="size-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
