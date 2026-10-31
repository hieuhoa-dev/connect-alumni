"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useApplyScholarship } from "@/hooks/use-scholarships";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { FileUploader } from "@/components/shared/file-uploader";

export interface FormQuestionItem {
  id: string;
  orderIndex: number;
  questionType: string;
  label: string;
  options: string[] | null;
  isRequired: boolean;
  config: any;
}

interface ScholarshipApplyFormProps {
  campaignId: string;
  isExpired: boolean;
  studentName: string;
  studentCode: string;
  questions?: FormQuestionItem[];
}

export const ScholarshipApplyForm = ({
  campaignId,
  isExpired,
  studentName,
  studentCode,
  questions = [],
}: ScholarshipApplyFormProps) => {
  const router = useRouter();

  // For dynamic form questions
  const [answers, setAnswers] = React.useState<Record<string, any>>({});
  const [fileUrls, setFileUrls] = React.useState<Record<string, string>>({});
  const [fileIds, setFileIds] = React.useState<Record<string, string>>({});

  // For default form questions when no dynamic form is configured
  const [gpa, setGpa] = React.useState("");
  const [circumstance, setCircumstance] = React.useState("");
  const [proofUrl, setProofUrl] = React.useState("");
  const [proofFileId, setProofFileId] = React.useState<string | null>(null);

  const [validationError, setValidationError] = React.useState<string | null>(null);

  const { mutate: apply, isPending, isSuccess, error } = useApplyScholarship();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    let formattedAnswers: Array<{ questionId: string; answerValue?: any; fileUrl?: string }> = [];

    if (questions.length > 0) {
      // Validate dynamic questions
      for (const q of questions) {
        if (q.isRequired) {
          const val = answers[q.id];
          const file = fileUrls[q.id];
          if (q.questionType === "file_upload" && !file) {
            setValidationError(`Vui lòng tải lên tài liệu minh chứng cho câu: "${q.label}"`);
            return;
          }
          if (
            q.questionType !== "file_upload" &&
            (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0))
          ) {
            setValidationError(`Vui lòng hoàn thành câu hỏi bắt buộc: "${q.label}"`);
            return;
          }
        }
      }

      formattedAnswers = questions.map((q) => ({
        questionId: q.id,
        answerValue: answers[q.id] ?? null,
        fileUrl: fileUrls[q.id] ?? null,
      }));
    }

    apply(
      {
        campaignId,
        answers: formattedAnswers,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.push("/student/scholarships");
          }, 2000);
        },
      },
    );
  };

  if (isExpired) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground">
        Chiến dịch học bổng này đã kết thúc nhận hồ sơ.
      </div>
    );
  }

  if (isSuccess) {
    return (
      <Alert className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-6 text-center space-y-2">
        <CheckCircle2 className="h-8 w-8 mx-auto" />
        <AlertDescription className="text-sm font-bold">
          Hồ sơ của bạn đã được nộp thành công!
        </AlertDescription>
        <p className="text-xs text-muted-foreground">
          Ban Chủ nhiệm Khoa sẽ xem xét hồ sơ và thông báo kết quả qua email và
          cổng thông tin. Đang chuyển hướng...
        </p>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(validationError || error) && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertDescription>
            {validationError || error?.message || "Có lỗi xảy ra khi nộp hồ sơ"}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Họ tên sinh viên</Label>
          <Input value={studentName} disabled className="text-xs bg-muted" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Mã số sinh viên</Label>
          <Input
            value={studentCode || "Chưa cập nhật"}
            disabled
            className="text-xs bg-muted"
          />
        </div>
      </div>

      {questions.length > 0 ? (
        <div className="space-y-4 pt-2">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="space-y-2 rounded-lg border border-border/70 p-3.5 bg-card/60 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {index + 1}
                </span>
                <Label className="text-xs font-semibold text-foreground leading-normal">
                  {q.label}
                  {q.isRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
              </div>

              <div className="pl-7 pt-1">
                {q.questionType === "short_text" && (
                  <Input
                    placeholder="Câu trả lời của bạn..."
                    value={answers[q.id] || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    disabled={isPending}
                    className="text-xs"
                  />
                )}

                {q.questionType === "long_text" && (
                  <Textarea
                    placeholder="Nhập nội dung chi tiết..."
                    rows={4}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    disabled={isPending}
                    className="text-xs leading-relaxed"
                  />
                )}

                {q.questionType === "single_choice" && q.options && (
                  <RadioGroup
                    value={answers[q.id] || ""}
                    onValueChange={(val) => handleSingleChoice(q.id, val)}
                    disabled={isPending}
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

                {q.questionType === "multi_choice" && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const checked = (answers[q.id] || []).includes(opt);
                      return (
                        <div key={opt} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${q.id}-${opt}`}
                            checked={checked}
                            onCheckedChange={(c) =>
                              handleMultiChoice(q.id, opt, !!c)
                            }
                            disabled={isPending}
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

                {q.questionType === "file_upload" && (
                  <FileUploader
                    value={{
                      fileId: fileIds[q.id] || undefined,
                      url: fileUrls[q.id] || undefined,
                    }}
                    onChange={(val) => {
                      setFileUrls((prev) => ({ ...prev, [q.id]: val?.url || "" }));
                      setFileIds((prev) => ({ ...prev, [q.id]: val?.fileId || "" }));
                    }}
                    purpose="proof_document"
                    disabled={isPending}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="gpa" className="text-xs font-medium">
              Điểm trung bình tích lũy (GPA) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="gpa"
              placeholder="Ví dụ: 3.65 (Thang điểm 4)"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              required
              disabled={isPending}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="circumstance" className="text-xs font-medium">
              Mô tả hoàn cảnh và nguyện vọng hỗ trợ <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="circumstance"
              placeholder="Trình bày hoàn cảnh kinh tế gia đình, khó khăn gặp phải và mục tiêu sử dụng học bổng..."
              rows={5}
              value={circumstance}
              onChange={(e) => setCircumstance(e.target.value)}
              required
              disabled={isPending}
              className="text-xs leading-relaxed"
            />
          </div>

          <FileUploader
            value={{ fileId: proofFileId || undefined, url: proofUrl || undefined }}
            onChange={(val) => {
              setProofUrl(val?.url || "");
              setProofFileId(val?.fileId || null);
            }}
            purpose="proof_document"
            label="Tài liệu minh chứng (Bảng điểm / Giấy xác nhận) *"
            helperText="Tải lên tài liệu minh chứng dạng PDF hoặc hình ảnh scan (Tối đa 10MB)"
            disabled={isPending}
          />
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="gap-2 font-medium"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang gửi hồ sơ...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Xác nhận nộp hồ sơ
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
