"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFormWithQuestions } from "@/actions/form-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Loader2,
  ListPlus,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

interface QuestionItem {
  id: string;
  label: string;
  questionType:
    | "short_text"
    | "long_text"
    | "single_choice"
    | "multi_choice"
    | "scale"
    | "file_upload";
  isRequired: boolean;
  options: string[];
}

export const FormBuilder = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<
    "survey" | "scholarship_application" | "event_feedback" | "other"
  >("survey");
  const [targetRole, setTargetRole] = useState<"all" | "student" | "alumni">(
    "all",
  );
  const [targetBatchesInput, setTargetBatchesInput] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"open" | "draft">("open");
  const [isGoogleForm, setIsGoogleForm] = useState(false);
  const [googleFormUrl, setGoogleFormUrl] = useState("");
  const [copiedScript, setCopiedScript] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: "q-1",
      label: "Họ và tên của bạn là gì?",
      questionType: "short_text",
      isRequired: true,
      options: [],
    },
    {
      id: "q-2",
      label: "Hiện tại bạn đang công tác / học tập tại đâu?",
      questionType: "short_text",
      isRequired: true,
      options: [],
    },
  ]);

  const addQuestion = () => {
    const newId = `q-${Date.now()}`;
    setQuestions([
      ...questions,
      {
        id: newId,
        label: "",
        questionType: "short_text",
        isRequired: true,
        options: ["Lựa chọn 1", "Lựa chọn 2"],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === questions.length - 1) return;

    const newQuestions = [...questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;
    setQuestions(newQuestions);
  };

  const updateQuestion = (
    index: number,
    field: keyof QuestionItem,
    value: any,
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const curOptions = newQuestions[questionIndex].options || [];
    newQuestions[questionIndex].options = [
      ...curOptions,
      `Lựa chọn ${curOptions.length + 1}`,
    ];
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[
      questionIndex
    ].options.filter((_, idx) => idx !== optionIndex);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      toast.add({
        type: "error",
        description: "Tiêu đề biểu mẫu phải có ít nhất 3 ký tự",
      });
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      toast.add({
        type: "error",
        description: "Mô tả biểu mẫu phải có ít nhất 5 ký tự",
      });
      return;
    }

    if (isGoogleForm && !googleFormUrl.trim()) {
      toast.add({
        type: "error",
        description: "Vui lòng nhập đường dẫn (URL) của Google Form",
      });
      return;
    }

    if (!isGoogleForm) {
      if (questions.length === 0) {
        toast.add({
          type: "error",
          description: "Vui lòng thêm ít nhất một câu hỏi",
        });
        return;
      }

      for (let i = 0; i < questions.length; i++) {
        if (!questions[i].label.trim()) {
          toast.add({
            type: "error",
            description: `Câu hỏi #${i + 1} chưa có nội dung`,
          });
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const targetBatches = targetBatchesInput
        ? targetBatchesInput
            .split(",")
            .map((b) => parseInt(b.trim(), 10))
            .filter((n) => !isNaN(n))
        : null;

      const validQuestions =
        isGoogleForm && questions.length === 0
          ? []
          : questions
              .filter((q) => q.label.trim())
              .map((q, idx) => ({
                orderIndex: idx,
                questionType: q.questionType,
                label: q.label.trim(),
                isRequired: q.isRequired,
                options:
                  q.questionType === "single_choice" ||
                  q.questionType === "multi_choice"
                    ? q.options
                    : null,
              }));

      await createFormWithQuestions({
        title: title.trim(),
        description: description.trim(),
        type,
        targetRole,
        targetBatches:
          targetBatches && targetBatches.length > 0 ? targetBatches : null,
        deadline: deadline ? new Date(deadline) : null,
        status,
        isGoogleForm,
        googleFormUrl: isGoogleForm ? googleFormUrl.trim() : null,
        questions: validQuestions,
      });

      toast.add({
        type: "success",
        description: isGoogleForm
          ? "Đã lưu khảo sát Google Form thành công!"
          : "Tạo biểu mẫu thành công!",
      });
      router.push("/faculty-admin/forms");
      router.refresh();
    } catch (err: any) {
      toast.add({
        type: "error",
        description: err.message || "Đã xảy ra lỗi khi tạo biểu mẫu",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Basic Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">
            Thông tin cơ bản biểu mẫu
          </CardTitle>
          <CardDescription>
            Thiết lập tiêu đề, phạm vi đối tượng và thời hạn thu thập ý kiến.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Tiêu đề biểu mẫu <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="VD: Khảo sát việc làm cựu sinh viên Khóa 2019-2023..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">
              Mô tả / Hướng dẫn <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="desc"
              rows={3}
              placeholder="Giải thích mục đích khảo sát hoặc hướng dẫn sinh viên hoàn thành (ít nhất 5 ký tự)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nền tảng khảo sát</Label>
              <Select
                value={isGoogleForm ? "google" : "native"}
                onValueChange={(val: any) => {
                  setIsGoogleForm(val === "google");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="native">Biểu mẫu trên hệ thống</SelectItem>
                  <SelectItem value="google">
                    Google Form (Kèm Webhook)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Loại biểu mẫu</Label>
              <Select
                value={type}
                onValueChange={(val: any) => {
                  if (val) setType(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="survey">Khảo sát ý kiến</SelectItem>
                  <SelectItem value="scholarship_application">
                    Hồ sơ xét học bổng
                  </SelectItem>
                  <SelectItem value="event_feedback">
                    Đánh giá sự kiện / Talkshow
                  </SelectItem>
                  <SelectItem value="other">Khác / Biểu mẫu chung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Đối tượng khảo sát</Label>
              <Select
                value={targetRole}
                onValueChange={(val: any) => {
                  if (val) setTargetRole(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mọi người</SelectItem>
                  <SelectItem value="student">Chỉ Sinh viên</SelectItem>
                  <SelectItem value="alumni">Chỉ Cựu sinh viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isGoogleForm && (
            <div className="rounded-lg border border-pine-200 dark:border-pine-800 bg-pine-50/50 dark:bg-pine-950/20 p-4 space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="googleFormUrl"
                  className="text-pine-800 dark:text-pine-200 font-medium"
                >
                  Đường dẫn Google Form (URL điền khảo sát){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="googleFormUrl"
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  value={googleFormUrl}
                  onChange={(e) => setGoogleFormUrl(e.target.value)}
                  required={isGoogleForm}
                />
                <p className="text-xs text-muted-foreground">
                  Người dùng khi bấm &quot;Tham gia khảo sát&quot; ở Góc chia sẻ
                  hoặc Portal sẽ được chuyển trực tiếp tới liên kết này.
                </p>
              </div>

              <div className="border-t border-pine-200/60 dark:border-pine-800/60 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-pine-900 dark:text-pine-100 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-pine-600" />
                    Cấu hình Webhook đồng bộ kết quả về Connect Alumni
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-pine-300 dark:border-pine-700"
                    onClick={() => {
                      const origin = typeof window !== "undefined" ? window.location.origin : "https://connect-alumni.dlu.edu.vn";
                      const sampleCode = `/**
 * GOOGLE APPS SCRIPT CHO GOOGLE FORM - HỆ THỐNG KHOA CNTT DLU
 * 
 * ⚠️ LƯU Ý KHI CHẠY THỬ Ở MÁY LOCAL (LOCALHOST):
 * - Máy chủ Google không thể gọi trực tiếp tới "http://localhost:3000".
 * - Khi test ở localhost, bạn mở terminal chạy: 'npx ngrok http 3000' rồi thay đường link ngrok vào APP_WEBHOOK_URL.
 */
var CONFIG = {
  APP_WEBHOOK_URL: "${origin}/api/webhooks/google-form",
  FORM_ID: "THAY_BANG_ID_FORM_SAU_KHI_LUU", // Lấy ID form trên danh sách quản lý
  WEBHOOK_SECRET: "" // Bí mật bảo mật (nếu có)
};

function onFormSubmit(e) {
  if (!e) {
    Logger.log("⚠️ Bạn vừa bấm nút 'Chạy' bằng tay. Vui lòng chọn hàm 'testWebhook' ở menu trên để test thử, hoặc tự điền form rồi bấm Gửi.");
    return;
  }

  try {
    var respondentEmail = "";
    var answers = [];

    if (e.response) {
      try { respondentEmail = e.response.getRespondentEmail() || ""; } catch(err) {}
      var itemResponses = e.response.getItemResponses();
      for (var i = 0; i < itemResponses.length; i++) {
        answers.push({
          question: itemResponses[i].getItem().getTitle(),
          answer: itemResponses[i].getResponse()
        });
      }
    } else if (e.namedValues) {
      for (var key in e.namedValues) {
        if (key === "Dấu thời gian" || key === "Timestamp") continue;
        if (key.toLowerCase().indexOf("email") !== -1) respondentEmail = e.namedValues[key][0];
        answers.push({ question: key, answer: e.namedValues[key][0] });
      }
    }

    var payload = {
      formId: CONFIG.FORM_ID,
      respondentEmail: respondentEmail,
      submittedAt: new Date().toISOString(),
      answers: answers
    };

    var res = UrlFetchApp.fetch(CONFIG.APP_WEBHOOK_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      headers: { "x-webhook-secret": CONFIG.WEBHOOK_SECRET },
      muteHttpExceptions: true
    });

    Logger.log("Mã HTTP: " + res.getResponseCode());
    Logger.log("Nội dung: " + res.getContentText());
  } catch (error) {
    Logger.log("Lỗi: " + error.toString());
  }
}

/**
 * Bấm chọn hàm này rồi bấm nút 'Chạy' (Run) để kiểm tra kết nối Webhook!
 */
function testWebhook() {
  Logger.log("Đang gửi thử nghiệm về: " + CONFIG.APP_WEBHOOK_URL);
  var payload = {
    formId: CONFIG.FORM_ID,
    respondentEmail: "alumni.test@dlu.edu.vn",
    submittedAt: new Date().toISOString(),
    answers: [{ question: "Thử nghiệm", answer: "Nội dung câu trả lời" }]
  };
  var res = UrlFetchApp.fetch(CONFIG.APP_WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: { "x-webhook-secret": CONFIG.WEBHOOK_SECRET },
    muteHttpExceptions: true
  });
  Logger.log("HTTP Code: " + res.getResponseCode());
  Logger.log("Response: " + res.getContentText());
}`;
                      navigator.clipboard.writeText(sampleCode);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                      toast.add({
                        type: "success",
                        description: "Đã sao chép mã script mẫu an toàn vào bộ nhớ tạm!",
                      });
                    }}
                  >
                    {copiedScript ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copiedScript ? "Đã chép" : "Sao chép mã Apps Script"}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Sau khi lưu biểu mẫu, bạn có thể lấy mã Apps Script đầy đủ có
                  kèm bí danh bảo mật (Webhook Secret) tại trang Quản lý biểu
                  mẫu.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batches">
                Giới hạn Khóa tuyển sinh (Tùy chọn)
              </Label>
              <Input
                id="batches"
                placeholder="VD: 2020, 2021, 2022 (để trống nếu không giới hạn)"
                value={targetBatchesInput}
                onChange={(e) => setTargetBatchesInput(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Nhập các năm cách nhau bởi dấu phẩy
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Hạn chót nộp (Tùy chọn)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Questions Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-foreground">
              Danh sách câu hỏi
            </h2>
            <p className="text-xs text-muted-foreground">
              Kéo thả hoặc sắp xếp các câu hỏi theo thứ tự mong muốn.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Thêm câu hỏi
          </Button>
        </div>

        {questions.map((q, idx) => (
          <Card key={q.id} className="relative border-l-4 border-l-primary/70">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-sm bg-muted px-2.5 py-1 rounded text-muted-foreground">
                  Câu #{idx + 1}
                </span>

                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === 0}
                    onClick={() => moveQuestion(idx, "up")}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === questions.length - 1}
                    onClick={() => moveQuestion(idx, "down")}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(idx)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 space-y-1.5">
                  <Label>Nội dung câu hỏi</Label>
                  <Input
                    placeholder="VD: Bạn đánh giá chương trình đào tạo của khoa như thế nào?"
                    value={q.label}
                    onChange={(e) =>
                      updateQuestion(idx, "label", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Loại câu hỏi</Label>
                  <Select
                    value={q.questionType}
                    onValueChange={(val: any) => {
                      if (val) updateQuestion(idx, "questionType", val);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short_text">
                        Văn bản ngắn (1 dòng)
                      </SelectItem>
                      <SelectItem value="long_text">
                        Văn bản dài (Đoạn văn)
                      </SelectItem>
                      <SelectItem value="single_choice">
                        Trắc nghiệm (1 lựa chọn)
                      </SelectItem>
                      <SelectItem value="multi_choice">
                        Hộp kiểm (Nhiều lựa chọn)
                      </SelectItem>
                      <SelectItem value="scale">Thang điểm (1 - 5)</SelectItem>
                      <SelectItem value="file_upload">
                        Tải file đính kèm
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Options for single_choice or multi_choice */}
              {(q.questionType === "single_choice" ||
                q.questionType === "multi_choice") && (
                <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Các lựa chọn câu trả lời
                  </Label>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-5">
                          {optIdx + 1}.
                        </span>
                        <Input
                          value={opt}
                          onChange={(e) =>
                            updateOption(idx, optIdx, e.target.value)
                          }
                          className="h-8 text-sm"
                          placeholder={`Lựa chọn ${optIdx + 1}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(idx, optIdx)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          disabled={q.options.length <= 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(idx)}
                    className="text-xs h-7 gap-1"
                  >
                    <ListPlus className="h-3.5 w-3.5" />
                    Thêm lựa chọn
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id={`required-${q.id}`}
                  checked={q.isRequired}
                  onChange={(e) =>
                    updateQuestion(idx, "isRequired", e.target.checked)
                  }
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <Label
                  htmlFor={`required-${q.id}`}
                  className="text-xs cursor-pointer"
                >
                  Bắt buộc trả lời
                </Label>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          className="w-full py-6 border-dashed flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-5 w-5" />
          Thêm câu hỏi mới vào biểu mẫu
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Hủy bỏ
        </Button>
        <Button type="submit" disabled={submitting} className="min-w-[140px]">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Lưu biểu mẫu
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
