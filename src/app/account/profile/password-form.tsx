"use client";

import { KeyRound, Loader2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { passwordChangeSchema } from "@/validators/profile-schema";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export const PasswordForm = () => {
  const [values, setValues] = React.useState(EMPTY);
  const [saving, setSaving] = React.useState(false);

  const setField = (key: keyof typeof EMPTY, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = passwordChangeSchema.safeParse(values);
    if (!parsed.success) {
      toast.add({
        type: "error",
        description: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        // Đăng xuất các thiết bị khác để mật khẩu cũ không còn giá trị
        revokeOtherSessions: true,
      });
      if (error) {
        toast.add({
          type: "error",
          description:
            error.message ||
            "Không thể đổi mật khẩu. Kiểm tra lại mật khẩu hiện tại.",
        });
        return;
      }
      toast.add({
        type: "success",
        description: "Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.",
      });
      setValues(EMPTY);
    } catch {
      toast.add({ type: "error", description: "Không thể đổi mật khẩu" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="pw-current">Mật khẩu hiện tại</FieldLabel>
          <Input
            id="pw-current"
            type="password"
            value={values.currentPassword}
            onChange={(e) => setField("currentPassword", e.target.value)}
            autoComplete="current-password"
            required
            disabled={saving}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pw-new">Mật khẩu mới</FieldLabel>
            <Input
              id="pw-new"
              type="password"
              value={values.newPassword}
              onChange={(e) => setField("newPassword", e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              disabled={saving}
            />
            <FieldDescription>Ít nhất 8 ký tự.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="pw-confirm">Nhập lại mật khẩu mới</FieldLabel>
            <Input
              id="pw-confirm"
              type="password"
              value={values.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
              autoComplete="new-password"
              required
              disabled={saving}
            />
          </Field>
        </div>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <KeyRound data-icon="inline-start" />
          )}
          Đổi mật khẩu
        </Button>
      </div>
    </form>
  );
};
