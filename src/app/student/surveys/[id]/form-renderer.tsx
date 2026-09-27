"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { submitFormResponse } from "@/actions/form-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

interface FormQuestion {
  id: string;
  orderIndex: number;
  questionType: string;
  label: string;
  options: string[] | null;
  isRequired: boolean;
  config: any;
}

interface FormRendererProps {
  form: {
    id: string;
    title: string;
    questions: FormQuestion[];
  };
  isExpired: boolean;
}

export const SurveyFormRenderer = ({ form, isExpired }: FormRendererProps) => {
  const router = useRouter();
  const [answers, setAnswers] = React.useState<Record<string, any>>({});
  const [fileUrls, setFileUrls] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleTextChange = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSingleChoice = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleMultiChoice = (qId: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const currentList: string[] = Array.isArray(prev[qId]) ? prev[qId] : [];
      const updated = checked
        ? [...currentList, option]
        : currentList.filter((item) => item !== option);
      return { ...prev, [qId]: updated };
    });
  };

  const handleScale = (qId: string, val: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate required questions
    for (const q of form.questions) {
      if (q.isRequired) {
        const ans = answers[q.id];
        const file = fileUrls[q.id];
        if (q.questionType === "file_upload") {
          if (!file) {
            setError(`Vui lòng hoàn thành câu hỏi bắt buộc: "${q.label}"`);
            setIsLoading(false);
            return;
          }
        } else if (
          ans === undefined ||
          ans === null ||
          ans === "" ||
          (Array.isArray(ans) && ans.length === 0)
        ) {
          setError(`Vui lòng hoàn thành câu hỏi bắt buộc: "${q.label}"`);
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      const payloadAnswers: Record<
        string,
        { answerValue?: any; fileUrl?: string }
      > = {};

      for (const q of form.questions) {
        payloadAnswers[q.id] = {
          answerValue: answers[q.id] !== undefined ? answers[q.id] : null,
          fileUrl: fileUrls[q.id] || undefined,
        };
      }

      await submitFormResponse({
        formId: form.id,
        answers: payloadAnswers,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/student/surveys");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi gửi biểu mẫu");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-8 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 mx-auto" />
        <AlertDescription className="text-base font-bold">
          Cảm ơn bạn đã hoàn thành biểu mẫu khảo sát!
        </AlertDescription>
        <p className="text-xs text-muted-foreground">
          Ý kiến quý báu của bạn đã được ghi nhận vào hệ thống. Đang quay lại
          danh sách...
        </p>
      </Alert>
    );
  }

  if (isExpired) {
    return (
      <div className="text-center py-8 text-muted-foreground text-xs">
        Biểu mẫu khảo sát này đã quá hạn nhận phản hồi.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {form.questions.map((q, index) => (
        <div
          key={q.id}
          className="space-y-3 rounded-lg border border-border/70 p-4 bg-card/60 shadow-sm"
        >
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {index + 1}
            </span>
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold text-foreground leading-normal">
                {q.label}
                {q.isRequired && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
            </div>
          </div>

          <div className="pl-7 pt-1">
            {/* 1. Short Text */}
            {q.questionType === "short_text" && (
              <Input
                placeholder="Câu trả lời của bạn..."
                value={answers[q.id] || ""}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
                disabled={isLoading}
                className="text-xs"
              />
            )}

            {/* 2. Long Text */}
            {q.questionType === "long_text" && (
              <Textarea
                placeholder="Nhập nội dung phản hồi chi tiết..."
                rows={4}
                value={answers[q.id] || ""}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
                disabled={isLoading}
                className="text-xs leading-relaxed"
              />
            )}

            {/* 3. Single Choice */}
            {q.questionType === "single_choice" && q.options && (
              <RadioGroup
                value={answers[q.id] || ""}
                onValueChange={(val) => handleSingleChoice(q.id, val)}
                disabled={isLoading}
                className="space-y-2"
              >
                {q.options.map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                    <Label
                      htmlFor={`${q.id}-${opt}`}
                      className="text-xs font-normal cursor-pointer"
                    >
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* 4. Multi Choice */}
            {q.questionType === "multi_choice" && q.options && (
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const isChecked =
                    Array.isArray(answers[q.id]) && answers[q.id].includes(opt);
                  return (
                    <div key={opt} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${q.id}-${opt}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleMultiChoice(q.id, opt, !!checked)
                        }
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={`${q.id}-${opt}`}
                        className="text-xs font-normal cursor-pointer"
                      >
                        {opt}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 5. Scale Rating (dynamic range từ config) */}
            {q.questionType === "scale" &&
              (() => {
                const min = q.config?.min ?? 1;
                const max = q.config?.max ?? 5;
                const range = Array.from(
                  { length: max - min + 1 },
                  (_, i) => min + i,
                );
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {range.map((num) => {
                        const isSelected = answers[q.id] === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleScale(q.id, num)}
                            className={`h-9 w-9 rounded-md border text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-background text-foreground hover:bg-muted"
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                    {q.config && (
                      <div
                        className="flex justify-between text-[11px] text-muted-foreground"
                        style={{ maxWidth: `${range.length * 44}px` }}
                      >
                        <span>{q.config.minLabel || `${min} — Kém nhất`}</span>
                        <span>{q.config.maxLabel || `${max} — Tốt nhất`}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

            {/* 6. File Upload */}
            {q.questionType === "file_upload" && (
              <div className="space-y-1.5">
                <Input
                  placeholder="Nhập đường dẫn tài liệu đính kèm (hoặc link Google Drive / Cloud)..."
                  value={fileUrls[q.id] || ""}
                  onChange={(e) =>
                    setFileUrls((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  disabled={isLoading}
                  className="text-xs font-mono"
                />
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={isLoading} className="font-medium">
          {isLoading ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Đang gửi phản hồi...
            </>
          ) : (
            <>
              <Send data-icon="inline-start" />
              Gửi câu trả lời
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
