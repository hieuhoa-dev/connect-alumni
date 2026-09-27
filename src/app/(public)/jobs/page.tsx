import * as React from "react";
import Link from "next/link";
import { getActiveJobPosts } from "@/actions/job-actions";
import { Button } from "@/components/ui/button";
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
  Filter,
} from "lucide-react";

interface JobsPageProps {
  searchParams: Promise<{
    search?: string;
    jobType?: "full_time" | "part_time" | "internship";
    location?: string;
  }>;
}

const JobsPage = async ({ searchParams }: JobsPageProps) => {
  const params = await searchParams;
  const jobs = await getActiveJobPosts({
    search: params.search,
    jobType: params.jobType,
    location: params.location,
    limit: 50,
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
          Cơ hội nghề nghiệp & Thực tập
        </h1>
        <p className="text-sm text-muted-foreground">
          Khám phá các vị trí tuyển dụng được xác thực bởi Khoa Công nghệ Thông
          tin từ các đối tác uy tín
        </p>
      </div>

      {/* Filter / Search Bar */}
      <form
        method="GET"
        className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-card p-4 rounded-xl border border-border/80 shadow-sm"
      >
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Tìm theo chức danh, kỹ năng, công ty..."
            defaultValue={params.search || ""}
            className="pl-9 text-xs"
          />
        </div>

        <div>
          <select
            name="jobType"
            defaultValue={params.jobType || ""}
            className="w-full h-8 rounded-lg border border-input bg-transparent px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Tất cả hình thức</option>
            <option value="full_time">Toàn thời gian (Full-time)</option>
            <option value="internship">Thực tập sinh (Internship)</option>
            <option value="part_time">Bán thời gian (Part-time)</option>
          </select>
        </div>

        <Button type="submit" size="sm" className="w-full text-xs font-medium">
          <Filter data-icon="inline-start" />
          Lọc tin tuyển dụng
        </Button>
      </form>

      {/* Jobs Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Tìm thấy{" "}
            <strong className="font-mono text-foreground">{jobs.length}</strong>{" "}
            cơ hội việc làm
          </span>
        </div>

        {jobs.length === 0 ? (
          <Empty className="border border-dashed border-border/80 bg-card py-16">
            <EmptyHeader>
              <EmptyMedia>
                <Briefcase className="size-8 opacity-40" />
              </EmptyMedia>
              <EmptyTitle>Không tìm thấy tin tuyển dụng</EmptyTitle>
              <EmptyDescription>
                Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả vị
                trí.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className="border border-border/80 hover:border-foreground/20 transition-colors shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 text-xs font-medium text-foreground">
                        <Building2 className="size-3.5 text-muted-foreground" />
                        <span>{job.company?.name}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
                          {job.company?.industry}
                        </span>
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {job.jobType.replace("_", " ")}
                      </span>
                      {job.salaryRange && (
                        <span className="inline-flex items-center rounded-full border border-[#CDE3CB]/60 bg-[#EDF3EC] px-2.5 py-0.5 text-[10px] font-mono font-medium text-[#346538] dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {job.salaryRange}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2 pb-3">
                  <p className="line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground font-mono">
                      <Calendar className="size-3.5" />
                      Hạn nộp:{" "}
                      {new Date(job.expiresAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/50 flex justify-end gap-2">
                  <Button
                    render={<Link href={`/jobs/${job.id}`} />}
                    nativeButton={false}
                    size="sm"
                  >
                    Xem chi tiết & Ứng tuyển
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
