"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { respondSpeakerInvitation } from "@/actions/event-actions";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export const SpeakerInviteResponseActions = ({
  inviteId,
}: {
  inviteId: string;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleResponse = async (status: "accepted" | "declined") => {
    setIsLoading(true);
    try {
      await respondSpeakerInvitation(inviteId, status);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-border">
      <Button
        size="sm"
        onClick={() => handleResponse("accepted")}
        disabled={isLoading}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
      >
        <Check className="h-3.5 w-3.5 mr-1" />
        Đồng ý làm Diễn giả
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleResponse("declined")}
        disabled={isLoading}
        className="text-xs h-8"
      >
        <X className="h-3.5 w-3.5 mr-1" />
        Từ chối
      </Button>
    </div>
  );
};
