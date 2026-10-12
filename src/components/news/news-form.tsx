"use client";

import { Loader2, Save, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { createNews, updateNews } from "@/actions/news-actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  isNewsCategory,
  NEWS_CATEGORIES,
  NEWS_CATEGORY_LABEL,
  type NewsCategory,
} from "@/lib/text";

export interface NewsFormValues {
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  coverImageUrl: string;
  isPinned: boolean;
  status: "draft" | "published";
}

const EMPTY_VALUES: NewsFormValues = {
  title: "",
  summary: "",
  content: "",
  category: "announcement",
  coverImageUrl: "",
  isPinned: false,
  status: "draft",
};

export const NewsForm = ({
  newsId,
  initial,
}: {
  newsId?: string;
  initial?: Partial<NewsFormValues>;
}) => {
  const router = useRouter();
  const [values, setValues] = React.useState<NewsFormValues>({
    ...EMPTY_VALUES,
    ...initial,
  });
  const [submitting, setSubmitting] = React.useState<
    "draft" | "published" | null
  >(null);

  const setField = <K extends keyof NewsFormValues>(
    key: K,
    value: NewsFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const submit = async (status: "draft" | "published") => {
    if (values.title.trim().length < 5) {
      toast.add({
        type: "error",
        description: "Tiêu đề cần ít nhất 5 ký tự",
      });
      return;
    }
    if (values.content.replace(/<[^>]*>/g, "").trim().length < 20) {
      toast.add({
        type: "error",
        description: "Nội dung bài viết cần ít nhất 20 ký tự",
      });
      return;
    }

    setSubmitting(status);
    try {
      const payload = {
        title: values.title,
        summary: values.summary || null,
        content: values.content,
        category: values.category,
        coverImageUrl: values.coverImageUrl.trim() || null,
        isPinned: values.isPinned,
        status,
      };
      if (newsId) {
        await updateNews(newsId, payload);
      } else {
        await createNews(payload);
      }
      toast.add({
        type: "success",
        description:
          status === "published" ? "Đã đăng bài viết" : "Đã lưu bản nháp",
      });
      router.push("/faculty-admin/news");
      router.refresh();
    } catch (err) {
      toast.add({
        type: "error",
        description:
          err instanceof Error ? err.message : "Không thể lưu bài viết",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const disabled = submitting !== null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit("published");
      }}
      className="flex flex-col gap-6"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="news-title">Tiêu đề</FieldLabel>
          <Input
            id="news-title"
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Ví dụ: Gặp mặt cựu sinh viên khóa 2016 nhân kỷ niệm 20 năm thành lập Khoa"
            maxLength={200}
            disabled={disabled}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="news-category">Chuyên mục</FieldLabel>
            <NativeSelect
              id="news-category"
              value={values.category}
              onChange={(e) => {
                const next = e.target.value;
                if (isNewsCategory(next)) setField("category", next);
              }}
              disabled={disabled}
              className="w-full"
            >
              {NEWS_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {NEWS_CATEGORY_LABEL[item]}
                </option>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="news-cover">Ảnh bìa (đường dẫn)</FieldLabel>
            <Input
              id="news-cover"
              type="url"
              value={values.coverImageUrl}
              onChange={(e) => setField("coverImageUrl", e.target.value)}
              placeholder="https://..."
              disabled={disabled}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="news-summary">Tóm tắt</FieldLabel>
          <Textarea
            id="news-summary"
            value={values.summary}
            onChange={(e) => setField("summary", e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Hai câu mô tả ngắn, hiển thị ở trang chủ và danh sách tin"
            disabled={disabled}
          />
          <FieldDescription>
            {values.summary.length}/300 ký tự. Bỏ trống thì trang chủ tự lấy
            đoạn đầu bài viết.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Nội dung</FieldLabel>
          <RichTextEditor
            content={values.content}
            onChange={(html) => setField("content", html)}
            placeholder="Viết nội dung bài tin tức..."
            minHeight="320px"
            disabled={disabled}
          />
        </Field>

        <Field orientation="horizontal">
          <Switch
            id="news-pinned"
            checked={values.isPinned}
            onCheckedChange={(checked) => setField("isPinned", checked)}
            disabled={disabled}
          />
          <FieldLabel htmlFor="news-pinned">
            Ghim làm tin chính trên trang chủ
          </FieldLabel>
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border-strong pt-4">
        <Button
          render={<Link href="/faculty-admin/news" />}
          nativeButton={false}
          variant="ghost"
        >
          Hủy
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => void submit("draft")}
          disabled={disabled}
        >
          {submitting === "draft" ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Lưu nháp
        </Button>
        <Button type="submit" disabled={disabled}>
          {submitting === "published" ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Send data-icon="inline-start" />
          )}
          {newsId ? "Lưu và đăng" : "Đăng bài"}
        </Button>
      </div>
    </form>
  );
};
