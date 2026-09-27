"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface CopyFormLinkButtonProps {
  formId: string;
}

export const CopyFormLinkButton = ({ formId }: CopyFormLinkButtonProps) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/student/surveys/${formId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.add({
        type: "success",
        description: "Đã sao chép liên kết khảo sát vào clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.add({
        type: "error",
        description: "Không thể sao chép liên kết",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="flex items-center gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground"
      title="Sao chép link làm khảo sát gửi sinh viên"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span>Đã chép</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Chép link</span>
        </>
      )}
    </Button>
  );
};
