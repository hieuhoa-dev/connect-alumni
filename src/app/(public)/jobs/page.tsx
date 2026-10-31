import * as React from "react";
import { getActiveJobPosts } from "@/actions/job-actions";
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
  const rawJobs = await getActiveJobPosts({
    search: params.search,
    jobType: params.jobType,
    location: params.location,
    limit: 100,
  });

  const jobs = (rawJobs || []).map((j) => ({
    ...j,
    salaryRange: j.salaryRange || "Thỏa thuận",
    requirements: j.requirements || undefined,
    company: {
      name: j.company?.name || "Doanh nghiệp đối tác",
      logoUrl: j.company?.logoUrl || undefined,
      industry: j.company?.industry || undefined,
    },
  }));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-pine-800">
          Cơ hội nghề nghiệp &amp; Thực tập — Đại học Đà Lạt
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Khám phá các vị trí tuyển dụng được xác thực bởi Trường Đại học Đà Lạt từ các đối tác doanh nghiệp chiến lược và mạng lưới cựu sinh viên uy tín.
        </p>
      </div>

      {/* Modern Editorial Filter & Listing */}
      <JobsFilterClient
        initialJobs={jobs}
        defaultSearch={params.search || ""}
        defaultJobType={params.jobType || "all"}
        defaultLocation={params.location || "all"}
      />
    </div>
  );
};

export default JobsPage;
