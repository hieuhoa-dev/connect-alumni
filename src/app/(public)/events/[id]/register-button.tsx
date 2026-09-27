"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegisterForEvent } from "@/hooks/use-events";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

interface EventRegisterButtonProps {
  eventId: string;
  isRegistered: boolean;
  isPassed: boolean;
  isLoggedIn: boolean;
}

export const EventRegisterButton = ({
  eventId,
  isRegistered: initialRegistered,
  isPassed,
  isLoggedIn,
}: EventRegisterButtonProps) => {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = React.useState(initialRegistered);

  const { mutate: register, isPending, error } = useRegisterForEvent();

  if (!isLoggedIn) {
    return (
      <Button
        render={<Link href={`/login?callbackUrl=/events/${eventId}`} />}
        nativeButton={false}
        className="w-full font-medium"
        disabled={isPassed}
      >
        Đăng nhập để đăng ký tham gia
      </Button>
    );
  }

  if (isRegistered) {
    return (
      <div className="flex items-center justify-center gap-2 p-2.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs border border-emerald-500/20">
        <CheckCircle2 className="h-4 w-4" />
        Bạn đã đăng ký tham gia sự kiện này
      </div>
    );
  }

  const handleRegister = () => {
    register(eventId, {
      onSuccess: () => {
        setIsRegistered(true);
        router.refresh();
      },
    });
  };

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-destructive">
          {error.message || "Không thể đăng ký tham gia."}
        </p>
      )}
      <Button
        onClick={handleRegister}
        disabled={isPending || isPassed}
        className="w-full font-medium"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang xử lý đăng ký...
          </>
        ) : isPassed ? (
          "Sự kiện đã kết thúc"
        ) : (
          "Xác nhận đăng ký tham gia"
        )}
      </Button>
    </div>
  );
};
