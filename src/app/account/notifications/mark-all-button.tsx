"use client";

import { CheckCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { markAllNotificationsRead } from "@/actions/notification-actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export const MarkAllButton = ({ disabled }: { disabled: boolean }) => {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await markAllNotificationsRead();
      router.refresh();
    } catch (err) {
      toast.add({
        type: "error",
        description: err instanceof Error ? err.message : "Thao tác thất bại",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleClick} disabled={disabled || busy}>
      {busy ? (
        <Loader2 data-icon="inline-start" className="animate-spin" />
      ) : (
        <CheckCheck data-icon="inline-start" />
      )}
      Đánh dấu tất cả đã đọc
    </Button>
  );
};
