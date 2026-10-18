"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Briefcase, GraduationCap, Building2, Filter, ChevronLeft, ChevronRight, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const AlumniDirectoryView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [major, setMajor] = React.useState(searchParams.get("major") || "");
  const [province, setProvince] = React.useState(searchParams.get("province") || "");
  const [batchYear, setBatchYear] = React.useState(searchParams.get("batchYear") || "");

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{ alumni: any[]; total: number; page: number; totalPages: number }>({
    alumni: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const currentPage = Number(searchParams.get("page")) || 1;

  const fetchAlumni = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchParams.get("search")) params.set("search", searchParams.get("search")!);
      if (searchParams.get("major")) params.set("major", searchParams.get("major")!);
      if (searchParams.get("province")) params.set("province", searchParams.get("province")!);
      if (searchParams.get("batchYear")) params.set("batchYear", searchParams.get("batchYear")!);
      if (searchParams.get("page")) params.set("page", searchParams.get("page")!);

      const res = await fetch(`/api/v1/alumni?${params.toString()}`);
      if (!res.ok) throw new Error("Lỗi khi tải dữ liệu");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  React.useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (major.trim()) params.set("major", major.trim());
    if (province.trim()) params.set("province", province.trim());
    if (batchYear.trim()) params.set("batchYear", batchYear.trim());
    params.set("page", "1");
    router.push(`/alumni?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/alumni?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <form
        onSubmit={handleApplyFilter}
        className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Tìm theo tên, công ty, chức vụ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-sm"
            />
          </div>
          <div>
            <Input
              placeholder="Chuyên ngành (VD: KTPM, Mạng...)"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <div>
            <Input
              placeholder="Tỉnh/Thành phố (VD: Lâm Đồng, TP.HCM)"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Khóa tuyển sinh (VD: 2020)"
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              className="h-10 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-xs text-neutral-500">
            Tìm thấy <strong className="text-neutral-800 dark:text-neutral-200">{data.total}</strong> cựu sinh viên đã xác thực
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setMajor("");
                setProvince("");
                setBatchYear("");
                router.push("/alumni");
              }}
              className="text-xs h-9"
            >
              Đặt lại
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#1B7A3E] hover:bg-[#156030] text-white text-xs h-9 px-4"
            >
              <Filter className="h-3.5 w-3.5 mr-1" />
              Áp dụng bộ lọc
            </Button>
          </div>
        </div>
      </form>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
      ) : data.alumni.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-12 text-center bg-white dark:bg-neutral-900">
          <GraduationCap className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Không tìm thấy cựu sinh viên phù hợp
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Thử nới lỏng từ khóa hoặc xóa bớt tiêu chí bộ lọc.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.alumni.map((item) => {
            const initials = item.fullName
              ? item.fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
              : "SV";

            return (
              <div
                key={item.id}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <Avatar className="h-12 w-12 border-2 border-emerald-100">
                      <AvatarImage src={item.avatarUrl || undefined} />
                      <AvatarFallback className="bg-emerald-100 text-[#1B7A3E] font-bold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate text-sm">
                          {item.fullName}
                        </h3>
                        <UserCheck className="h-4 w-4 text-[#1B7A3E] shrink-0" />
                      </div>
                      <div className="text-xs text-neutral-500 truncate flex items-center gap-1 mt-0.5">
                        <GraduationCap className="h-3 w-3 shrink-0" />
                        <span>Khóa {item.batchYear ? `K${item.batchYear}` : "—"} {item.major ? `• ${item.major}` : ""}</span>
                      </div>
                      {item.province && (
                        <div className="text-xs text-neutral-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{item.province}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workplace info */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                    {item.currentCompanyName || item.currentTitle ? (
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <div className="font-medium text-neutral-800 dark:text-neutral-200">
                            {item.currentTitle || "Vị trí chuyên môn"}
                          </div>
                          <div className="text-neutral-500">
                            {item.currentCompanyName}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 italic">
                        Chưa công khai đơn vị công tác
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {item.bio && (
                    <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                      {item.bio}
                    </p>
                  )}

                  {/* Skills badges */}
                  {item.skills && item.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.skills.slice(0, 3).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {item.skills.length > 3 && (
                        <span className="text-[10px] text-neutral-400 self-center">
                          +{item.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Direct Contact if allowed */}
                {(item.email || item.phone) && (
                  <div className="mt-4 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
                    <span>{item.email || item.phone}</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200">
                      Công khai liên hệ
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="h-8 text-xs"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Trang trước
          </Button>
          <span className="text-xs text-neutral-600 px-2">
            Trang {data.page} / {data.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= data.totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="h-8 text-xs"
          >
            Trang sau
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};
