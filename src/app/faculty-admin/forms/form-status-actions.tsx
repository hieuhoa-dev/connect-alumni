"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateFormStatus } from "@/actions/form-actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export const FormStatusActions = ({ formId, status }: { formId: string; status: "draft" | "open" | "closed" }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const nextStatus = status === "open" ? "closed" : "open";
  return <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => startTransition(async () => {
    try {
      await updateFormStatus({ formId, status: nextStatus });
      toast.add({ type: "success", description: nextStatus === "open" ? "Đã mở biểu mẫu nhận phản hồi" : "Đã đóng biểu mẫu" });
      router.refresh();
    } catch (error) {
      toast.add({ type: "error", description: error instanceof Error ? error.message : "Không thể cập nhật trạng thái biểu mẫu" });
    }
  })}>{pending ? "Đang cập nhật..." : status === "open" ? "Đóng biểu mẫu" : status === "draft" ? "Công khai biểu mẫu" : "Mở lại biểu mẫu"}</Button>;
};
