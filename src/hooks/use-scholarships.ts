"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyScholarshipApplications,
  getScholarshipCampaigns,
  getAllApplicationsForReview,
  applyForScholarship,
  reviewScholarshipApplication,
  createDonationPledge,
  confirmFulfillPledge,
  cancelPledge,
} from "@/actions/scholarship-actions";
import type {
  DonationPledgeInput,
  ScholarshipApplicationReviewInput,
} from "@/validators/scholarship-schema";
import { toast } from "@/components/ui/toast";

export const scholarshipKeys = {
  all: ["scholarships"] as const,
  campaigns: () => [...scholarshipKeys.all, "campaigns"] as const,
  myApplications: () => [...scholarshipKeys.all, "my-applications"] as const,
  applicationsForReview: (campaignId?: string) =>
    [...scholarshipKeys.all, "applications-review", campaignId] as const,
};

export const useScholarshipCampaigns = () => {
  return useQuery({
    queryKey: scholarshipKeys.campaigns(),
    queryFn: () => getScholarshipCampaigns(),
  });
};

export const useMyScholarshipApplications = () => {
  return useQuery({
    queryKey: scholarshipKeys.myApplications(),
    queryFn: () => getMyScholarshipApplications(),
  });
};

export const useApplicationsForReview = (campaignId?: string) => {
  return useQuery({
    queryKey: scholarshipKeys.applicationsForReview(campaignId),
    queryFn: () => getAllApplicationsForReview(campaignId),
  });
};

export const useApplyScholarship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      formResponseId,
    }: {
      campaignId: string;
      formResponseId?: string;
    }) => applyForScholarship(campaignId, formResponseId),
    onSuccess: () => {
      toast.add({
        type: "success",
        description: "Nộp hồ sơ xét duyệt học bổng thành công!",
      });
      queryClient.invalidateQueries({
        queryKey: scholarshipKeys.myApplications(),
      });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Có lỗi xảy ra khi nộp hồ sơ",
      });
    },
  });
};

export const useReviewScholarshipApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      input,
    }: {
      applicationId: string;
      input: ScholarshipApplicationReviewInput;
    }) => reviewScholarshipApplication(applicationId, input),
    onSuccess: () => {
      toast.add({
        type: "success",
        description: "Đã cập nhật trạng thái xét duyệt!",
      });
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.all });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Có lỗi xảy ra khi xét duyệt",
      });
    },
  });
};

export const useCreateDonationPledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DonationPledgeInput) => createDonationPledge(input),
    onSuccess: () => {
      toast.add({
        type: "success",
        description: "Ghi nhận cam kết tài trợ thành công!",
      });
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.campaigns() });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Không thể tạo cam kết tài trợ",
      });
    },
  });
};

export const useConfirmFulfillPledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pledgeId: string) => confirmFulfillPledge(pledgeId),
    onSuccess: () => {
      toast.add({
        type: "success",
        description: "Đã ghi nhận nhận tiền thành công!",
      });
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.all });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Lỗi khi xác nhận đóng góp",
      });
    },
  });
};

export const useCancelPledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pledgeId: string) => cancelPledge(pledgeId),
    onSuccess: () => {
      toast.add({
        type: "success",
        description: "Đã hủy cam kết tài trợ",
      });
      queryClient.invalidateQueries({ queryKey: scholarshipKeys.all });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Lỗi khi hủy cam kết",
      });
    },
  });
};
