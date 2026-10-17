"use client";

import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Briefcase,
  Building2,
  MapPin,
  Search,
  Calendar,
  X,
  SlidersHorizontal,
  ChevronRight,
  ArrowUpRight,
  DollarSign,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface JobItem {
  id: string;
  title: string;
  jobType: "full_time" | "internship" | "part_time";
  location: string;
  salaryRange: string;
  description: string;
  requirements?: string;
  expiresAt: string | Date;
  company: {
    name: string;
    logoUrl?: string;
    industry?: string;
  };
}

interface JobsFilterClientProps {
  initialJobs: JobItem[];
  defaultSearch?: string;
  defaultJobType?: string;
  defaultLocation?: string;
}

const JOB_TYPES = [
  { value: "all", label: "Tất cả hình thức" },
  { value: "full_time", label: "Toàn thời gian" },
  { value: "internship", label: "Thực tập sinh" },
  { value: "part_time", label: "Bán thời gian" },
];

const LOCATIONS = [
  { value: "all", label: "Tất cả địa điểm" },
  { value: "Đà Lạt", label: "TP. Đà Lạt" },
  { value: "Lâm Đồng", label: "Lâm Đồng (Các huyện)" },
  { value: "Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
  { value: "Remote", label: "Từ xa / Hybrid" },
];

const INDUSTRIES = [
  { value: "all", label: "Tất cả ngành nghề" },
  { value: "Công nghệ", label: "Công nghệ & AI" },
  { value: "Nông nghiệp", label: "Nông nghiệp cao" },
  { value: "Du lịch", label: "Du lịch & Khách sạn" },
  { value: "Sinh học", label: "Sinh học & Dược" },
  { value: "Giáo dục", label: "Giáo dục & Đào tạo" },
  { value: "Tài chính", label: "Tài chính & Luật" },
];

const SALARY_TIERS = [
  { value: "all", label: "Tất cả mức lương" },
  { value: "high", label: "> 20 triệu" },
  { value: "mid", label: "10 - 20 triệu" },
  { value: "intern", label: "< 10 triệu" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "salary_desc", label: "Lương cao nhất" },
  { value: "deadline_asc", label: "Sắp hết hạn" },
];

export const JobsFilterClient = ({
  initialJobs,
  defaultSearch = "",
  defaultJobType = "all",
  defaultLocation = "all",
}: JobsFilterClientProps) => {
  const [search, setSearch] = React.useState(defaultSearch);
  const [jobType, setJobType] = React.useState(defaultJobType);
  const [location, setLocation] = React.useState(defaultLocation);
  const [industry, setIndustry] = React.useState("all");
  const [salaryTier, setSalaryTier] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");

  // Keyboard shortcut to focus search input
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute counts per job type
  const countsPerType = React.useMemo(() => {
    const counts: Record<string, number> = { all: initialJobs.length };
    initialJobs.forEach((j) => {
      counts[j.jobType] = (counts[j.jobType] || 0) + 1;
    });
    return counts;
  }, [initialJobs]);

  const filteredJobs = React.useMemo(() => {
    let result = initialJobs.filter((job) => {
      // 1. Keyword search (title, company, description, requirements, location)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchDesc = job.description.toLowerCase().includes(q);
        const matchComp = job.company?.name?.toLowerCase().includes(q);
        const matchReq = job.requirements?.toLowerCase().includes(q);
        const matchLoc = job.location.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchComp && !matchReq && !matchLoc) {
          return false;
        }
      }

      // 2. Job Type filter
      if (jobType !== "all" && job.jobType !== jobType) {
        return false;
      }

      // 3. Location filter
      if (location !== "all") {
        if (!job.location.toLowerCase().includes(location.toLowerCase())) {
          return false;
        }
      }

      // 4. Industry filter
      if (industry !== "all") {
        if (
          !job.company?.industry
            ?.toLowerCase()
            .includes(industry.toLowerCase())
        ) {
          return false;
        }
      }

      // 5. Salary Tier filter
      if (salaryTier !== "all") {
        const s = job.salaryRange || "";
        // parse numbers in salaryRange, e.g. "18.000.000 - 32.000.000 đ"
        const nums = s.match(/\d+/g);
        const maxVal = nums ? parseInt(nums.join(""), 10) : 0;
        // Check approx in millions
        if (salaryTier === "high" && !s.includes("2") && !s.includes("3") && !s.includes("4")) {
          // not > 20tr
          if (maxVal < 20000000) return false;
        } else if (salaryTier === "mid") {
          if (!s.includes("1") && maxVal < 10000000) return false;
        } else if (salaryTier === "intern") {
          if (maxVal > 15000000 && !s.includes("5.") && !s.includes("6.") && !s.includes("7.") && !s.includes("8.")) return false;
        }
      }

      return true;
    });

    // 6. Sorting
    result.sort((a, b) => {
      if (sortBy === "deadline_asc") {
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      }
      if (sortBy === "salary_desc") {
        // approximate salary comparator
        return b.salaryRange.localeCompare(a.salaryRange);
      }
      // default: newest
      return b.id.localeCompare(a.id);
    });

    return result;
  }, [initialJobs, search, jobType, location, industry, salaryTier, sortBy]);

  const hasActiveFilters =
    search.trim() !== "" ||
    jobType !== "all" ||
    location !== "all" ||
    industry !== "all" ||
    salaryTier !== "all" ||
    sortBy !== "newest";

  const handleReset = () => {
    setSearch("");
    setJobType("all");
    setLocation("all");
    setIndustry("all");
    setSalaryTier("all");
    setSortBy("newest");
  };

  const formatJobTypeBadge = (type: string) => {
    switch (type) {
      case "full_time":
        return "Toàn thời gian";
      case "internship":
        return "Thực tập sinh";
      case "part_time":
        return "Bán thời gian";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Modern Optimized Filter Bento */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top bar: Search Input + Sort Dropdown + Reset */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm chức danh, kỹ năng, công ty, địa điểm... (Nhấn '/' để tìm)"
              className="pl-9 pr-9 text-xs h-10 rounded-lg bg-background border-border/80 focus:border-[#1E4D2B]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-3 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline absolute right-3 top-3 text-[10px] font-mono text-muted-foreground/60 border border-border/60 rounded px-1.5 py-0.2">
                /
              </span>
            )}
          </div>

          {/* Quick Sort Control */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium mr-1">
              <ArrowUpDown className="size-3.5" />
              <span>Sắp xếp:</span>
            </div>
            <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/30">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSortBy(opt.value)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                    sortBy === opt.value
                      ? "bg-background text-[#1E4D2B] font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3 text-xs font-medium text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw className="size-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        {/* Primary Job Type Quick Tabs */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {JOB_TYPES.map((jt) => {
              const active = jobType === jt.value;
              const count = countsPerType[jt.value] || 0;
              return (
                <button
                  key={jt.value}
                  type="button"
                  onClick={() => setJobType(jt.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-[#1E4D2B] text-white shadow-xs font-semibold"
                      : "bg-muted/40 text-foreground/80 hover:bg-muted border border-border/60"
                  }`}
                >
                  <span>{jt.label}</span>
                  <span
                    className={`inline-flex items-center justify-center text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-background text-muted-foreground border border-border/40"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter Row: Location, Industry, Salary Tier */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border/50 text-xs">
          {/* Location */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MapPin className="size-3 text-[#1E4D2B]" />
              Địa điểm làm việc:
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {LOCATIONS.map((loc) => {
                const active = location === loc.value;
                return (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => setLocation(loc.value)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      active
                        ? "bg-[#1E4D2B]/15 text-[#1E4D2B] border border-[#1E4D2B]/40 font-semibold"
                        : "bg-background text-muted-foreground hover:text-foreground border border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    {loc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Industry */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Building2 className="size-3 text-[#1E4D2B]" />
              Lĩnh vực chuyên môn:
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {INDUSTRIES.map((ind) => {
                const active = industry === ind.value;
                return (
                  <button
                    key={ind.value}
                    type="button"
                    onClick={() => setIndustry(ind.value)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      active
                        ? "bg-[#1E4D2B]/15 text-[#1E4D2B] border border-[#1E4D2B]/40 font-semibold"
                        : "bg-background text-muted-foreground hover:text-foreground border border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    {ind.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Salary Tier */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="size-3 text-[#1E4D2B]" />
              Mức lương mong muốn:
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {SALARY_TIERS.map((sal) => {
                const active = salaryTier === sal.value;
                return (
                  <button
                    key={sal.value}
                    type="button"
                    onClick={() => setSalaryTier(sal.value)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      active
                        ? "bg-[#1E4D2B]/15 text-[#1E4D2B] border border-[#1E4D2B]/40 font-semibold"
                        : "bg-background text-muted-foreground hover:text-foreground border border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    {sal.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 text-[11px]">
            <span className="text-muted-foreground font-medium">Đang lọc:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Từ khóa: "{search}"
                <button type="button" onClick={() => setSearch("")} className="hover:opacity-75">
                  <X className="size-3" />
                </button>
              </span>
            )}
            {jobType !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1E4D2B]/10 text-[#1E4D2B] border border-[#1E4D2B]/20">
                Hình thức: {JOB_TYPES.find((j) => j.value === jobType)?.label}
                <button type="button" onClick={() => setJobType("all")} className="hover:opacity-75">
                  <X className="size-3" />
                </button>
              </span>
            )}
            {location !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1E4D2B]/10 text-[#1E4D2B] border border-[#1E4D2B]/20">
                Khu vực: {LOCATIONS.find((l) => l.value === location)?.label}
                <button type="button" onClick={() => setLocation("all")} className="hover:opacity-75">
                  <X className="size-3" />
                </button>
              </span>
            )}
            {industry !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1E4D2B]/10 text-[#1E4D2B] border border-[#1E4D2B]/20">
                Ngành: {INDUSTRIES.find((i) => i.value === industry)?.label}
                <button type="button" onClick={() => setIndustry("all")} className="hover:opacity-75">
                  <X className="size-3" />
                </button>
              </span>
            )}
            {salaryTier !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1E4D2B]/10 text-[#1E4D2B] border border-[#1E4D2B]/20">
                Lương: {SALARY_TIERS.find((s) => s.value === salaryTier)?.label}
                <button type="button" onClick={() => setSalaryTier("all")} className="hover:opacity-75">
                  <X className="size-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Header Counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Tìm thấy{" "}
          <strong className="font-mono text-foreground font-semibold text-sm">
            {filteredJobs.length}
          </strong>{" "}
          vị trí tuyển dụng phù hợp (trong tổng số {initialJobs.length} tin)
        </span>
      </div>

      {/* Jobs Listing */}
      {filteredJobs.length === 0 ? (
        <Empty className="border border-dashed border-border/80 bg-card py-16">
          <EmptyHeader>
            <EmptyMedia>
              <Briefcase className="size-8 opacity-40 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Không tìm thấy tin tuyển dụng phù hợp</EmptyTitle>
            <EmptyDescription>
              Hãy thử nới lỏng bộ lọc hoặc tìm kiếm bằng từ khóa tổng quát hơn.
            </EmptyDescription>
          </EmptyHeader>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg bg-background hover:bg-muted cursor-pointer transition-colors"
            >
              <RotateCcw className="size-3.5" />
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="border border-border/80 hover:border-[#1E4D2B]/40 hover:shadow-xs transition-all bg-card group"
            >
              <CardHeader className="pb-2.5 pt-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base sm:text-lg font-semibold hover:text-[#1E4D2B] transition-colors">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1.5 group-hover:text-[#1E4D2B]"
                      >
                        {job.title}
                        <ArrowUpRight className="size-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#1E4D2B]" />
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2 text-xs font-medium text-foreground">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-foreground font-semibold">
                          {job.company?.name}
                        </span>
                      </span>
                      {job.company?.industry && (
                        <>
                          <span className="text-muted-foreground/60">·</span>
                          <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                            {job.company?.industry}
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {formatJobTypeBadge(job.jobType)}
                    </span>
                    {job.salaryRange && (
                      <span className="inline-flex items-center rounded-full border border-[#CDE3CB]/60 bg-[#EDF3EC] px-2.5 py-0.5 text-[11px] font-mono font-medium text-[#346538]">
                        {job.salaryRange}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="text-xs text-muted-foreground space-y-2 pb-3 px-4 sm:px-6">
                <p className="line-clamp-2 leading-relaxed text-foreground/80">
                  {job.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="size-3.5 text-[#1E4D2B]" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground font-mono">
                    <Calendar className="size-3.5" />
                    Hạn nộp:{" "}
                    {new Date(job.expiresAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-2.5 pb-3.5 px-4 sm:px-6 border-t border-border/40 flex justify-end gap-2">
                <Link
                  href={`/jobs/${job.id}`}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "text-xs font-medium cursor-pointer bg-[#1E4D2B] hover:bg-[#1E4D2B]/90 text-white inline-flex items-center gap-1",
                  )}
                >
                  Xem chi tiết & Ứng tuyển
                  <ChevronRight className="size-3.5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
