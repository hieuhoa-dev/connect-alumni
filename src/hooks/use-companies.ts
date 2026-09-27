"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompaniesForFaculty,
  getMyCompanies,
  registerCompany,
  reviewCompany,
  switchActiveCompany,
} from "@/actions/company-actions";
import type { CompanyCreateInput } from "@/validators/company-schema";
import { toast } from "@/components/ui/toast";

export const companyKeys = {
  all: ["companies"] as const,
  facultyList: (status?: string) =>
    [...companyKeys.all, "faculty", status] as const,
  myCompanies: () => [...companyKeys.all, "my"] as const,
};

export const useFacultyCompanies = (
  status?: "pending" | "verified" | "rejected",
) => {
  return useQuery({
    queryKey: companyKeys.facultyList(status),
    queryFn: () => getCompaniesForFaculty(status),
  });
};

export const useMyCompanies = () => {
  return useQuery({
    queryKey: companyKeys.myCompanies(),
    queryFn: () => getMyCompanies(),
  });
};

export const useRegisterCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompanyCreateInput) => registerCompany(input),
    onSuccess: () => {
      toast.add({
        type: "success",
        description:
          "Đăng ký hồ sơ doanh nghiệp thành công! Vui lòng chờ Khoa duyệt.",
      });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Có lỗi xảy ra khi tạo hồ sơ",
      });
    },
  });
};

export const useReviewCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      companyId: string;
      status: "verified" | "rejected";
      rejectedReason?: string;
    }) => reviewCompany(data),
    onSuccess: (_, variables) => {
      toast.add({
        type: "success",
        description:
          variables.status === "verified"
            ? "Đã phê duyệt hồ sơ doanh nghiệp!"
            : "Đã từ chối hồ sơ doanh nghiệp",
      });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Không thể cập nhật trạng thái duyệt",
      });
    },
  });
};

export const useSwitchCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => switchActiveCompany(companyId),
    onSuccess: () => {
      toast.add({
        type: "success",
        description: "Đã chuyển đổi doanh nghiệp làm việc",
      });
      queryClient.invalidateQueries({ queryKey: companyKeys.myCompanies() });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Lỗi khi chuyển đổi doanh nghiệp",
      });
    },
  });
};
