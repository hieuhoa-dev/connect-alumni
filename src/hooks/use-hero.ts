"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  publishHeroSlide,
  unpublishHeroSlide,
  type HeroSlideInput,
  type AdminHeroSlideRow,
} from "@/actions/hero-actions";
import { toast } from "@/components/ui/toast";

export const heroKeys = {
  all: ["hero-slides"] as const,
  admin: () => [...heroKeys.all, "admin"] as const,
};

export const useAdminHeroSlides = (initialData?: AdminHeroSlideRow[]) => {
  return useQuery({
    queryKey: heroKeys.admin(),
    queryFn: async () => {
      return await getAdminHeroSlides();
    },
    initialData,
  });
};

export const useCreateHeroSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: HeroSlideInput) => createHeroSlide(input),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Đã tạo mới slide banner thành công!");
        queryClient.invalidateQueries({ queryKey: heroKeys.admin() });
      } else {
        toast.error(res.error || "Có lỗi xảy ra khi tạo mới.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Lỗi kết nối khi tạo slide banner.");
    },
  });
};

export const useUpdateHeroSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: HeroSlideInput }) =>
      updateHeroSlide(id, input),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Đã cập nhật slide banner thành công!");
        queryClient.invalidateQueries({ queryKey: heroKeys.admin() });
      } else {
        toast.error(res.error || "Có lỗi xảy ra khi cập nhật.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Lỗi kết nối khi cập nhật slide banner.");
    },
  });
};

export const useDeleteHeroSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHeroSlide(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Đã xóa slide banner thành công!");
        queryClient.invalidateQueries({ queryKey: heroKeys.admin() });
      } else {
        toast.error(res.error || "Không thể xóa slide banner.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Lỗi kết nối khi xóa slide banner.");
    },
  });
};

export const useToggleHeroSlideStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      currentStatus,
    }: {
      id: string;
      currentStatus: "draft" | "published";
    }) => {
      if (currentStatus === "published") {
        return await unpublishHeroSlide(id);
      } else {
        return await publishHeroSlide(id);
      }
    },
    onSuccess: (res, vars) => {
      if (res.success) {
        toast.success(
          vars.currentStatus === "published"
            ? "Đã chuyển slide về bản nháp."
            : "Đã xuất bản slide lên trang chủ.",
        );
        queryClient.invalidateQueries({ queryKey: heroKeys.admin() });
      } else {
        toast.error(res.error || "Có lỗi xảy ra khi đổi trạng thái.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Lỗi kết nối khi đổi trạng thái slide.");
    },
  });
};

export const useReorderHeroSlides = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slideIds: string[]) => reorderHeroSlides(slideIds),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Đã lưu thứ tự hiển thị banner.");
        queryClient.invalidateQueries({ queryKey: heroKeys.admin() });
      } else {
        toast.error(res.error || "Không thể cập nhật thứ tự.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Lỗi kết nối khi cập nhật thứ tự.");
    },
  });
};
