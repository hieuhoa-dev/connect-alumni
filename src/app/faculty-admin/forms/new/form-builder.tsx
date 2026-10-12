"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ListPlus,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createFormWithQuestions } from "@/actions/form-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

const formTypeItems = [{ value: "survey", label: "Khảo sát ý kiến" }, { value: "scholarship_application", label: "Hồ sơ xét học bổng" }, { value: "event_feedback", label: "Đánh giá sự kiện / Talkshow" }, { value: "other", label: "Khác / Biểu mẫu chung" }];
const targetRoleItems = [{ value: "all", label: "Tất cả mọi người" }, { value: "student", label: "Chỉ Sinh viên" }, { value: "alumni", label: "Chỉ Cựu sinh viên" }];
const formStatusItems = [{ value: "open", label: "Mở ngay (Công khai)" }, { value: "draft", label: "Bản nháp (Lưu tạm)" }];
const questionTypeItems = [{ value: "short_text", label: "Văn bản ngắn (1 dòng)" }, { value: "long_text", label: "Văn bản dài (Đoạn văn)" }, { value: "single_choice", label: "Trắc nghiệm (1 lựa chọn)" }, { value: "multi_choice", label: "Hộp kiểm (Nhiều lựa chọn)" }, { value: "scale", label: "Thang điểm (1 - 5)" }, { value: "file_upload", label: "Tải file đính kèm" }];

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
    const newId = crypto.randomUUID();
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

  const updateQuestion = <K extends keyof QuestionItem>(
    index: number,
    field: K,
    value: QuestionItem[K],
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    if (
      field === "questionType" &&
      (value === "single_choice" || value === "multi_choice") &&
      !newQuestions[index].options.length
    ) {
      newQuestions[index].options = ["Lựa chọn 1", "Lựa chọn 2"];
    }
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const curOptions = newQuestions[questionIndex].options || [];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: [...curOptions, `Lựa chọn ${curOptions.length + 1}`],
    };
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: newQuestions[questionIndex].options.map((option, index) =>
        index === optionIndex ? value : option,
      ),
    };
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: newQuestions[questionIndex].options.filter(
        (_, idx) => idx !== optionIndex,
      ),
    };
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
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
      const question = questions[i];
      if (
        (question.questionType === "single_choice" ||
          question.questionType === "multi_choice") &&
        (!question.options.length ||
          question.options.some((option) => !option.trim()) ||
          new Set(question.options.map((option) => option.trim())).size !==
            question.options.length)
      ) {
        toast.add({
          type: "error",
          description: `Câu hỏi #${i + 1} cần các lựa chọn khác nhau, không để trống`,
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const batchValues = targetBatchesInput.trim()
        ? targetBatchesInput.split(",").map((batch) => batch.trim())
        : [];
      if (
        batchValues.some(
          (batch) => !/^\d{4}$/.test(batch) || Number(batch) < 1900,
        )
      )
        throw new Error(
          "Khóa tuyển sinh phải là năm hợp lệ, cách nhau bằng dấu phẩy",
        );
      const targetBatches = targetBatchesInput.trim()
        ? targetBatchesInput.split(",").map((b) => Number(b.trim()))
        : null;

      await createFormWithQuestions({
        title: title.trim(),
        description: description.trim(),
        type,
        targetRole,
        targetBatches:
          targetBatches && targetBatches.length > 0 ? targetBatches : null,
        deadline: deadline ? new Date(deadline) : null,
        status,
        questions: questions.map((q, idx) => ({
          orderIndex: idx,
          questionType: q.questionType,
          label: q.label.trim(),
          isRequired: q.isRequired,
          options:
            q.questionType === "single_choice" ||
            q.questionType === "multi_choice"
              ? q.options.map((option) => option.trim())
              : null,
        })),
      });

      toast.add({
        type: "success",
        description: "Tạo biểu mẫu thành công!",
      });
      router.push("/faculty-admin/forms");
      router.refresh();
    } catch (err: unknown) {
      toast.add({
        type: "error",
        description:
          err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo biểu mẫu",
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
              <Label>Loại biểu mẫu</Label>
              <Select
                items={formTypeItems}
                value={type}
                onValueChange={(val) => {
                  if (val) setType(val as typeof type);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="survey">Khảo sát ý kiến</SelectItem>
                    <SelectItem value="scholarship_application">
                      Hồ sơ xét học bổng
                    </SelectItem>
                    <SelectItem value="event_feedback">
                      Đánh giá sự kiện / Talkshow
                    </SelectItem>
                    <SelectItem value="other">Khác / Biểu mẫu chung</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Đối tượng khảo sát</Label>
              <Select
                items={targetRoleItems}
                value={targetRole}
                onValueChange={(val) => {
                  if (val) setTargetRole(val as typeof targetRole);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả mọi người</SelectItem>
                    <SelectItem value="student">Chỉ Sinh viên</SelectItem>
                    <SelectItem value="alumni">Chỉ Cựu sinh viên</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                items={formStatusItems}
                value={status}
                onValueChange={(val) => {
                  if (val) setStatus(val as typeof status);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="open">Mở ngay (Công khai)</SelectItem>
                    <SelectItem value="draft">Bản nháp (Lưu tạm)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                    items={questionTypeItems}
                    value={q.questionType}
                    onValueChange={(val) => {
                      if (val)
                        updateQuestion(
                          idx,
                          "questionType",
                          val as QuestionItem["questionType"],
                        );
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
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
                        <SelectItem value="scale">
                          Thang điểm (1 - 5)
                        </SelectItem>
                        <SelectItem value="file_upload">
                          Tải file đính kèm
                        </SelectItem>
                      </SelectGroup>
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
                      // biome-ignore lint/suspicious/noArrayIndexKey: These controlled choice inputs use positions while their labels are edited.
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
