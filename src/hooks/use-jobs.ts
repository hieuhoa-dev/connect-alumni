"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveJobPosts,
  createJobPost,
  reviewJobPost,
  getEmployerJobs,
  getJobsForFacultyReview,
} from "@/actions/job-actions";
import type { JobPostInput } from "@/validators/job-schema";
import { toast } from "@/components/ui/toast";

export const jobKeys = {
  all: ["jobs"] as const,
  active: (params?: Record<string, any>) => [...jobKeys.all, "active", params] as const,
  employer: (companyId?: string) => [...jobKeys.all, "employer", companyId] as const,
  faculty: (status?: string) => [...jobKeys.all, "faculty", status] as const,
};

export const useActiveJobPosts = (params?: {
  search?: string;
  industry?: string;
  jobType?: "full_time" | "part_time" | "internship";
  location?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: jobKeys.active(params),
    queryFn: () => getActiveJobPosts(params),
  });
};

export const useEmployerJobs = (companyId?: string) => {
  return useQuery({
    queryKey: jobKeys.employer(companyId),
    queryFn: () => getEmployerJobs(companyId),
  });
};

export const useFacultyJobs = (status?: "pending" | "approved" | "rejected" | "expired") => {
  return useQuery({
    queryKey: jobKeys.faculty(status),
    queryFn: () => getJobsForFacultyReview(status),
  });
};

export const useCreateJobPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: JobPostInput) => createJobPost(input),
    onSuccess: () => {
      toast.add({
        type: "success",
        description: "Đăng tin tuyển dụng thành công! Vui lòng chờ Khoa duyệt.",
      });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Có lỗi xảy ra khi tạo tin tuyển dụng",
      });
    },
  });
};

export const useReviewJobPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      jobId: string;
      status: "approved" | "rejected";
      rejectedReason?: string;
    }) => reviewJobPost(data),
    onSuccess: (_, variables) => {
      toast.add({
        type: "success",
        description:
          variables.status === "approved"
            ? "Đã phê duyệt tin tuyển dụng!"
            : "Đã từ chối tin tuyển dụng",
      });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Lỗi khi xét duyệt tin",
      });
    },
  });
};
