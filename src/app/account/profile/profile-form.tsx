"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { updateCurrentUserProfile } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

export interface ProfileFormValues {
  fullName: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  studentCode: string;
  batchYear: string;
  graduationYear: string;
}

interface ProfileFormProps {
  initial: ProfileFormValues;
  role: string;
}

const toYear = (value: string): number | null => {
  return value.trim() ? Number(value) : null;
};

export const ProfileForm = ({ initial, role }: ProfileFormProps) => {
  const router = useRouter();
  const [values, setValues] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);

  const showStudentFields = role === "student" || role === "alumni";
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);

  const setField = (key: keyof ProfileFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateCurrentUserProfile({
        fullName: values.fullName,
        phone: values.phone,
        bio: values.bio,
        avatarUrl: values.avatarUrl,
        // Vai trò không có các trường này thì giữ nguyên giá trị trống
        studentCode: showStudentFields ? values.studentCode : "",
        batchYear: showStudentFields ? toYear(values.batchYear) : null,
        graduationYear: showStudentFields
          ? toYear(values.graduationYear)
          : null,
      });
      if ("error" in updated) {
        toast.add({ type: "error", description: updated.error });
        return;
      }
      setValues({
        fullName: updated.fullName,
        phone: updated.phone ?? "",
        bio: updated.bio ?? "",
        avatarUrl: updated.avatarUrl ?? "",
        studentCode: updated.studentCode ?? "",
        batchYear: updated.batchYear ? String(updated.batchYear) : "",
        graduationYear: updated.graduationYear
          ? String(updated.graduationYear)
          : "",
      });
      toast.add({ type: "success", description: "Đã lưu hồ sơ" });
      router.refresh();
    } catch (err) {
      toast.add({
        type: "error",
        description: err instanceof Error ? err.message : "Không thể lưu hồ sơ",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="profile-name">Họ và tên</FieldLabel>
          <Input
            id="profile-name"
            value={values.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            disabled={saving}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="profile-phone">Số điện thoại</FieldLabel>
            <Input
              id="profile-phone"
              type="tel"
              value={values.phone}
              onChange={(e) => setField("phone", e.target.value)}
              autoComplete="tel"
              maxLength={20}
              disabled={saving}
            />
            <FieldDescription>
              Chỉ Ban Chủ nhiệm Khoa nhìn thấy số điện thoại.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-avatar">Ảnh đại diện (URL)</FieldLabel>
            <Input
              id="profile-avatar"
              type="url"
              value={values.avatarUrl}
              onChange={(e) => setField("avatarUrl", e.target.value)}
              placeholder="https://"
              maxLength={500}
              disabled={saving}
            />
          </Field>
        </div>

        {showStudentFields && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="profile-code">Mã sinh viên</FieldLabel>
              <Input
                id="profile-code"
                value={values.studentCode}
                onChange={(e) => setField("studentCode", e.target.value)}
                maxLength={20}
                disabled={saving}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-batch">
                Khóa (năm nhập học)
              </FieldLabel>
              <Input
                id="profile-batch"
                type="number"
                inputMode="numeric"
                min={1990}
                max={new Date().getFullYear() + 6}
                step={1}
                value={values.batchYear}
                onChange={(e) => setField("batchYear", e.target.value)}
                maxLength={4}
                disabled={saving}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-grad">Năm tốt nghiệp</FieldLabel>
              <Input
                id="profile-grad"
                type="number"
                inputMode="numeric"
                min={values.batchYear ? Number(values.batchYear) : 1990}
                max={new Date().getFullYear() + 6}
                step={1}
                value={values.graduationYear}
                onChange={(e) => setField("graduationYear", e.target.value)}
                maxLength={4}
                disabled={saving}
              />
            </Field>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="profile-bio">Giới thiệu bản thân</FieldLabel>
          <Textarea
            id="profile-bio"
            value={values.bio}
            onChange={(e) => setField("bio", e.target.value)}
            rows={5}
            maxLength={1000}
            disabled={saving}
          />
          <FieldDescription>{values.bio.length}/1000 ký tự.</FieldDescription>
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setValues(initial)}
          disabled={saving || !dirty}
        >
          Hoàn tác
        </Button>
        <Button type="submit" disabled={saving || !dirty}>
          {saving ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
};
