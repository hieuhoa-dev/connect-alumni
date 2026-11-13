"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Code2, Check, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { getGoogleFormAppsScriptAction } from "@/actions/form-actions";

interface GoogleFormWebhookButtonProps {
  formId: string;
}

export const GoogleFormWebhookButton = ({
  formId,
}: GoogleFormWebhookButtonProps) => {
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopyScript = async () => {
    setLoading(true);
    try {
      const data = await getGoogleFormAppsScriptAction(formId);
      await navigator.clipboard.writeText(data.script);
      setCopied(true);
      toast.add({
        type: "success",
        description:
          "Đã sao chép mã Google Apps Script có kèm Webhook Secret vào clipboard!",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err.message || "Không thể lấy mã Apps Script",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopyScript}
      disabled={loading}
      className="flex items-center gap-1.5 h-8 text-xs text-pine-700 dark:text-pine-300 border-pine-200 dark:border-pine-800 hover:bg-pine-50 dark:hover:bg-pine-950/40"
      title="Sao chép mã Google Apps Script để kích hoạt Webhook"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Code2 className="h-3.5 w-3.5" />
      )}
      <span>{copied ? "Đã chép Script" : "Mã Webhook Script"}</span>
    </Button>
  );
};
