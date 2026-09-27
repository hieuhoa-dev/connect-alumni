"use client";

import { useRouter } from "next/navigation";
import {
  useConfirmFulfillPledge,
  useCancelPledge,
} from "@/hooks/use-scholarships";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

interface PledgeActionsProps {
  pledgeId: string;
  status: string;
}

export const PledgeActions = ({ pledgeId, status }: PledgeActionsProps) => {
  const router = useRouter();
  const { mutate: confirmPledge, isPending: isConfirming } =
    useConfirmFulfillPledge();
  const { mutate: cancel, isPending: isCancelling } = useCancelPledge();

  if (status !== "pledged") {
    return null;
  }

  const isWorking = isConfirming || isCancelling;

  const handleConfirm = () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xác nhận đã nhận số tiền này vào Quỹ không? Thao tác này sẽ cập nhật số dư quỹ và không thể hoàn tác.",
      )
    ) {
      return;
    }

    confirmPledge(pledgeId, {
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  const handleCancel = () => {
    if (!confirm("Hủy bỏ cam kết tài trợ này?")) return;

    cancel(pledgeId, {
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="sm"
        variant="default"
        onClick={handleConfirm}
        disabled={isWorking}
        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {isConfirming ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3 mr-1" />
        )}
        Xác nhận nhận tiền
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleCancel}
        disabled={isWorking}
        className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
      >
        {isCancelling ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};
