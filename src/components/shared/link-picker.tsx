"use client";

import * as React from "react";
import { PREDEFINED_LINK_OPTIONS } from "@/lib/link-options";
import { isSafeHref } from "@/lib/safe-url";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle, Link as LinkIcon, ExternalLink } from "lucide-react";

export interface LinkPickerProps {
  value?: string;
  onChange: (href: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const LinkPicker = ({
  value = "",
  onChange,
  label,
  placeholder = "https://... hoặc /duong-dan-noi-bo",
  disabled = false,
  className,
}: LinkPickerProps) => {
  const isPredefined = PREDEFINED_LINK_OPTIONS.some((opt) => opt.href === value);
  const [selectedPreset, setSelectedPreset] = React.useState<string>(
    isPredefined ? value : value ? "custom" : "",
  );
  const [customValue, setCustomValue] = React.useState<string>(
    isPredefined ? "" : value,
  );

  React.useEffect(() => {
    const matched = PREDEFINED_LINK_OPTIONS.some((opt) => opt.href === value);
    if (matched) {
      setSelectedPreset(value);
      setCustomValue("");
    } else if (value) {
      setSelectedPreset("custom");
      setCustomValue(value);
    } else {
      setSelectedPreset("");
      setCustomValue("");
    }
  }, [value]);

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPreset(val);
    if (val === "custom") {
      onChange(customValue);
    } else {
      onChange(val);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    onChange(val);
  };

  const hasInvalidCustom =
    selectedPreset === "custom" && customValue.trim().length > 0 && !isSafeHref(customValue);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label className="text-xs font-medium text-foreground">{label}</Label>}

      <div className="space-y-2">
        <div className="relative">
          <select
            value={selectedPreset}
            onChange={handleSelectPreset}
            disabled={disabled}
            className="w-full text-xs h-9 rounded-lg border border-input bg-background px-3 py-1 shadow-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
          >
            <option value="">-- Chọn liên kết đích (hoặc nhập riêng) --</option>
            <optgroup label="Trang trong hệ thống">
              {PREDEFINED_LINK_OPTIONS.map((opt) => (
                <option key={opt.href} value={opt.href}>
                  {opt.label} ({opt.href})
                </option>
              ))}
            </optgroup>
            <optgroup label="Tùy chọn khác">
              <option value="custom">Nhập liên kết khác (URL HTTPS hoặc đường dẫn)...</option>
            </optgroup>
          </select>
        </div>

        {selectedPreset === "custom" && (
          <div className="space-y-1">
            <div className="relative">
              <Input
                type="text"
                placeholder={placeholder}
                value={customValue}
                onChange={handleCustomChange}
                disabled={disabled}
                className={cn(
                  "text-xs pl-8",
                  hasInvalidCustom && "border-destructive focus-visible:ring-destructive",
                )}
              />
              <LinkIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            </div>

            {hasInvalidCustom && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>
                  Chỉ chấp nhận đường dẫn nội bộ (bắt đầu bằng &apos;/&apos;) hoặc liên kết bảo mật HTTPS (&apos;https://&apos;).
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
