import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobPostById } from "@/actions/job-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  MapPin,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

const JobDetailPage = async ({ params }: JobDetailPageProps) => {
  const { id } = await params;
  const job = await getJobPostById(id);

  // Chỉ approved và expired mới hiển thị công khai — pending/rejected không lộ
  if (!job || (job.status !== "approved" && job.status !== "expired")) {
    notFound();
  }

  const isExpired = new Date(job.expiresAt) < new Date();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Back link */}
      <div>
        <Button
          render={<Link href="/jobs" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <ArrowLeft data-icon="inline-start" />
          Quay lại danh sách việc làm
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content (2 cols) */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {job.jobType.replace("_", " ")}
              </span>
              {isExpired ? (
                <span className="inline-flex items-center rounded-full border border-[#F5C2C4]/60 bg-[#FDEBEC] px-2.5 py-0.5 text-[10px] font-medium text-[#9F2F2D] dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
                  Đã hết hạn nhận hồ sơ
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-[#CDE3CB]/60 bg-[#EDF3EC] px-2.5 py-0.5 text-[10px] font-medium text-[#346538] dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Đang mở tuyển
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground leading-snug">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Building2 className="size-3.5 text-muted-foreground" />
                {job.company?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted-foreground" />
                {job.location}
              </span>
              {job.salaryRange && (
                <span className="font-mono font-medium text-foreground">
                  {job.salaryRange}
                </span>
              )}
            </div>
          </div>

          {/* Job Description */}
          <Card className="border border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Mô tả công việc
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
              {job.description}
            </CardContent>
          </Card>

          {/* Job Requirements */}
          <Card className="border border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Yêu cầu ứng viên
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
              {job.requirements}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info (1 col) */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Ứng tuyển vị trí này
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-muted-foreground">
                  Hạn chót nộp hồ sơ:
                </span>
                <p className="font-medium text-foreground text-sm">
                  {new Date(job.expiresAt).toLocaleDateString("vi-VN", {
                    dateStyle: "full",
                  })}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <span className="text-muted-foreground">
                  Phương thức ứng tuyển:
                </span>
                <p className="font-mono text-xs break-all bg-muted/60 p-2.5 rounded-lg border border-border/70">
                  {job.applyUrlOrEmail}
                </p>
              </div>

              {!isExpired && (
                <Button
                  render={
                    <a
                      href={
                        job.applyUrlOrEmail.includes("@")
                          ? `mailto:${job.applyUrlOrEmail}?subject=Ung tuyen ${encodeURIComponent(job.title)}`
                          : job.applyUrlOrEmail
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  nativeButton={false}
                  className="w-full font-medium"
                >
                  Nộp đơn ứng tuyển ngay
                  <ExternalLink data-icon="inline-end" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Company Card */}
          <Card className="border border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Avatar className="size-8 border border-border/60">
                  <AvatarImage src={job.company?.logoUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {job.company?.name?.slice(0, 2).toUpperCase() || "CO"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-base font-semibold">
                  {job.company?.name}
                </CardTitle>
                <ShieldCheck className="size-4 text-primary shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p className="line-clamp-4 leading-relaxed">
                {job.company?.description}
              </p>
              <div className="space-y-1 pt-2 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground">Lĩnh vực: </span>
                  <span className="font-medium text-foreground">
                    {job.company?.industry}
                  </span>
                </div>
                {job.company?.website && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <Globe className="size-3.5" />
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {job.company.website}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
