"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { reviewExperiencePost } from "@/actions/experience-actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const ExperienceReviewActions = ({ postId }: { postId: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAction = async (status: "published" | "rejected") => {
    setIsLoading(true);
    try {
      await reviewExperiencePost(postId, status);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={() => handleAction("published")}
        disabled={isLoading}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
      >
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
        Phê duyệt xuất bản
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction("rejected")}
        disabled={isLoading}
        className="text-destructive text-xs h-8"
      >
        <XCircle className="h-3.5 w-3.5 mr-1" />
        Từ chối
      </Button>
    </div>
  );
};
