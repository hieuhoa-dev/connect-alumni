import * as React from "react";
import { getActiveJobPosts } from "@/actions/job-actions";
import { sampleDLUJobs } from "@/lib/dlu-sample-data";
import { JobsFilterClient } from "@/components/jobs/jobs-filter-client";

interface JobsPageProps {
  searchParams: Promise<{
    search?: string;
    jobType?: "full_time" | "part_time" | "internship";
    location?: string;
  }>;
}

const JobsPage = async ({ searchParams }: JobsPageProps) => {
  const params = await searchParams;
  let jobs: any[] = [];
  try {
    jobs = await getActiveJobPosts({
      search: params.search,
      jobType: params.jobType,
      location: params.location,
      limit: 100,
    });
  } catch (err) {
    console.error("Failed to fetch active jobs:", err);
  }

  // Tự động dùng dữ liệu mẫu chất lượng cao của Trường Đại học Đà Lạt nếu DB trống
  const displayJobs = jobs.length > 0 ? jobs : sampleDLUJobs;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1E4D2B]">
          Cơ hội nghề nghiệp & Thực tập — Đại học Đà Lạt
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Khám phá các vị trí tuyển dụng được xác thực bởi Trường Đại học Đà Lạt từ các đối tác doanh nghiệp chiến lược và mạng lưới cựu sinh viên uy tín.
        </p>
      </div>

      {/* Modern Editorial Filter & Listing */}
      <JobsFilterClient
        initialJobs={displayJobs}
        defaultSearch={params.search || ""}
        defaultJobType={params.jobType || "all"}
        defaultLocation={params.location || "all"}
      />
    </div>
  );
};

export default JobsPage;
