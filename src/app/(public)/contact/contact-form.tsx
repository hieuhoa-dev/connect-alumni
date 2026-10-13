"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import * as React from "react";
import { submitContactMessage } from "@/actions/contact-actions";
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

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

export const ContactForm = () => {
  const [values, setValues] = React.useState(EMPTY);
  const [honeypot, setHoneypot] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const setField = (key: keyof typeof EMPTY, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactMessage({
        ...values,
        phone: values.phone || null,
        website: honeypot,
      });
      setSent(true);
      setValues(EMPTY);
    } catch (err) {
      toast.add({
        type: "error",
        description:
          err instanceof Error ? err.message : "Không thể gửi tin nhắn",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-border-strong bg-card p-8">
        <CheckCircle2 className="size-8 text-[#346538]" />
        <h2 className="font-serif text-2xl text-foreground">Đã gửi tin nhắn</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Cảm ơn bạn. Tin nhắn đã được gửi tới bộ phận quản trị DLU Alumni.
          Chúng tôi sẽ liên hệ qua email bạn cung cấp khi có phản hồi.
        </p>
        <Button variant="outline" onClick={() => setSent(false)}>
          Gửi tin nhắn khác
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contact-name">Họ và tên</FieldLabel>
            <Input
              id="contact-name"
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              autoComplete="name"
              required
              maxLength={100}
              disabled={submitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="contact-email">Email</FieldLabel>
            <Input
              id="contact-email"
              type="email"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              autoComplete="email"
              required
              maxLength={150}
              disabled={submitting}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contact-phone">Số điện thoại</FieldLabel>
            <Input
              id="contact-phone"
              type="tel"
              value={values.phone}
              onChange={(e) => setField("phone", e.target.value)}
              autoComplete="tel"
              maxLength={20}
              disabled={submitting}
            />
            <FieldDescription>Không bắt buộc.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="contact-subject">Tiêu đề</FieldLabel>
            <Input
              id="contact-subject"
              value={values.subject}
              onChange={(e) => setField("subject", e.target.value)}
              required
              maxLength={150}
              disabled={submitting}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="contact-message">Nội dung</FieldLabel>
          <Textarea
            id="contact-message"
            value={values.message}
            onChange={(e) => setField("message", e.target.value)}
            rows={6}
            required
            minLength={10}
            maxLength={3000}
            disabled={submitting}
          />
          <FieldDescription>
            {values.message.length}/3000 ký tự.
          </FieldDescription>
        </Field>

        {/* Ô chống bot: ẩn khỏi người dùng và trình đọc màn hình */}
        <div
          aria-hidden
          className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        >
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Send data-icon="inline-start" />
          )}
          Gửi tin nhắn
        </Button>
      </div>
    </form>
  );
};
