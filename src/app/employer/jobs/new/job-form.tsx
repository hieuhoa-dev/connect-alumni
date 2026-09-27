"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createJobPost } from "@/actions/job-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export const NewJobForm = ({ companyId }: { companyId: string }) => {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [requirements, setRequirements] = React.useState("");
  const [location, setLocation] = React.useState("TP. Hồ Chí Minh");
  const [jobType, setJobType] = React.useState<
    "full_time" | "part_time" | "internship"
  >("internship");
  const [salaryRange, setSalaryRange] = React.useState("Thỏa thuận");
  const [applyUrlOrEmail, setApplyUrlOrEmail] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createJobPost({
        companyId,
        title,
        description,
        requirements,
        location,
        jobType,
        salaryRange: salaryRange || null,
        applyUrlOrEmail,
        expiresAt: new Date(expiresAt),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/employer/jobs");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi tạo tin tuyển dụng.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-6 text-center space-y-2">
        <CheckCircle2 className="size-8 mx-auto" />
        <AlertDescription className="text-sm font-bold">
          Tin tuyển dụng đã được gửi phê duyệt thành công!
        </AlertDescription>
        <p className="text-xs text-muted-foreground">
          Ban Chủ nhiệm Khoa sẽ xem xét và phản hồi trong thời gian sớm nhất.
          Đang chuyển hướng...
        </p>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs font-medium">
          Tiêu đề vị trí tuyển dụng
        </Label>
        <Input
          id="title"
          placeholder="Ví dụ: Thực tập sinh Lập trình Web Fullstack (Next.js / Node.js)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          disabled={isLoading}
          className="text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="jobType" className="text-xs font-medium">
            Hình thức làm việc
          </Label>
          <select
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value as any)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={isLoading}
          >
            <option value="internship">Thực tập sinh (Internship)</option>
            <option value="full_time">Toàn thời gian (Full-time)</option>
            <option value="part_time">Bán thời gian (Part-time)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="salary" className="text-xs font-medium">
            Mức lương / Trợ cấp
          </Label>
          <Input
            id="salary"
            placeholder="8 - 12 triệu / Thỏa thuận"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
            disabled={isLoading}
            className="text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expires" className="text-xs font-medium">
            Ngày hết hạn nộp
          </Label>
          <Input
            id="expires"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            required
            disabled={isLoading}
            className="text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-xs font-medium">
            Địa điểm làm việc
          </Label>
          <Input
            id="location"
            placeholder="Khu Công nghệ Cao, TP. Thủ Đức (Hybrid)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            disabled={isLoading}
            className="text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="apply" className="text-xs font-medium">
            Email hoặc Link nhận hồ sơ
          </Label>
          <Input
            id="apply"
            placeholder="recruitment@company.com"
            value={applyUrlOrEmail}
            onChange={(e) => setApplyUrlOrEmail(e.target.value)}
            required
            disabled={isLoading}
            className="text-xs"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="desc" className="text-xs font-medium">
          Mô tả công việc
        </Label>
        <Textarea
          id="desc"
          rows={5}
          placeholder="Mô tả các nhiệm vụ chính, dự án tham gia, môi trường làm việc..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={10}
          disabled={isLoading}
          className="text-xs leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="req" className="text-xs font-medium">
          Yêu cầu ứng viên
        </Label>
        <Textarea
          id="req"
          rows={5}
          placeholder="Yêu cầu về kiến thức chuyên môn, ngôn ngữ lập trình, kỹ năng mềm..."
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          required
          minLength={10}
          disabled={isLoading}
          className="text-xs leading-relaxed"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={isLoading} className="font-medium">
          {isLoading ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Đang tạo tin...
            </>
          ) : (
            <>
              <Send data-icon="inline-start" />
              Gửi tin chờ Khoa duyệt
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
