import { z } from "zod";

export const formQuestionInputSchema = z
  .object({
    id: z.string().optional(),
    orderIndex: z.number().int().nonnegative(),
    questionType: z.enum([
      "short_text",
      "long_text",
      "single_choice",
      "multi_choice",
      "scale",
      "file_upload",
    ]),
    label: z.string().trim().min(1, "Nội dung câu hỏi không được để trống"),
    options: z
      .array(z.string().trim().min(1, "Lựa chọn không được để trống"))
      .optional()
      .nullable(),
    isRequired: z.boolean().default(true),
    config: z
      .object({
        min: z.number().int().optional(),
        max: z.number().int().optional(),
        minLabel: z.string().optional(),
        maxLabel: z.string().optional(),
        allowedFileTypes: z.array(z.string()).optional(),
        maxFileSizeMb: z.number().positive().optional(),
      })
      .optional()
      .nullable(),
  })
  .superRefine((question, ctx) => {
    if (
      question.questionType === "single_choice" ||
      question.questionType === "multi_choice"
    ) {
      if (
        !question.options?.length ||
        new Set(question.options).size !== question.options.length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message:
            "Câu hỏi lựa chọn cần có các lựa chọn khác nhau, không để trống",
        });
      }
    }
    if (question.questionType === "scale") {
      const min = question.config?.min ?? 1;
      const max = question.config?.max ?? 5;
      if (max < min || max - min > 100) {
        ctx.addIssue({
          code: "custom",
          path: ["config"],
          message: "Thang điểm không hợp lệ (tối đa 101 mức)",
        });
      }
    }
  });

export const formCreateSchema = z.object({
  type: z.enum([
    "survey",
    "scholarship_application",
    "event_feedback",
    "other",
  ]),
  title: z.string().trim().min(3, "Tiêu đề form ít nhất 3 ký tự"),
  description: z.string().trim().min(5, "Mô tả form ít nhất 5 ký tự"),
  targetBatches: z
    .array(z.coerce.number().int().min(1900).max(9999))
    .optional()
    .nullable(),
  targetRole: z.enum(["student", "alumni", "all"]).default("all"),
  deadline: z
    .string()
    .or(z.date())
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null))
    .refine(
      (val) => val === null || Number.isFinite(val.getTime()),
      "Hạn chót không hợp lệ",
    ),
  status: z.enum(["draft", "open", "closed"]).default("open"),
  questions: z
    .array(formQuestionInputSchema)
    .min(1, "Form phải có ít nhất 1 câu hỏi"),
});

export const formResponseSubmitSchema = z.object({
  formId: z.string().uuid("ID form không hợp lệ"),
  answers: z.record(
    z.string().uuid(), // questionId
    z.object({
      answerValue: z
        .union([z.string(), z.number(), z.array(z.string()), z.null()])
        .optional(),
      fileUrl: z
        .string()
        .trim()
        .url("Đường dẫn tài liệu không hợp lệ")
        .refine(
          (value) => /^https?:\/\//i.test(value),
          "Chỉ chấp nhận đường dẫn HTTP hoặc HTTPS",
        )
        .optional()
        .nullable(),
    }),
  ),
});

export type FormCreateInput = z.infer<typeof formCreateSchema>;
export type FormQuestionInput = z.infer<typeof formQuestionInputSchema>;
export type FormResponseSubmitInput = z.infer<typeof formResponseSubmitSchema>;

export const formStatusUpdateSchema = z.object({
  formId: z.string().uuid("ID biểu mẫu không hợp lệ"),
  status: z.enum(["draft", "open", "closed"]),
});

export const isFormEligible = (
  form: { targetRole: string; targetBatches: number[] | null },
  user: { role: string; profile?: { batchYear: number | null } | null },
) => {
  if (user.role === "admin" || user.role === "faculty_staff") return true;
  if (form.targetRole !== "all" && form.targetRole !== user.role) return false;
  return (
    !form.targetBatches?.length ||
    (user.profile?.batchYear != null &&
      form.targetBatches.includes(user.profile.batchYear))
  );
};

export const getFormAnswerError = (
  question: {
    questionType: string;
    label: string;
    isRequired: boolean;
    options: string[] | null;
    config: { min?: number; max?: number } | null;
  },
  answer?: { answerValue?: unknown; fileUrl?: string | null },
) => {
  const value = answer?.answerValue;
  const empty =
    question.questionType === "file_upload"
      ? !answer?.fileUrl?.trim()
      : value == null ||
        (typeof value === "string" && !value.trim()) ||
        (Array.isArray(value) && !value.length);
  if (empty)
    return question.isRequired
      ? `Vui lòng trả lời câu hỏi bắt buộc: "${question.label}"`
      : null;
  let valid = false;
  switch (question.questionType) {
    case "short_text":
    case "long_text":
      valid = typeof value === "string";
      break;
    case "single_choice":
      valid = typeof value === "string" && !!question.options?.includes(value);
      break;
    case "multi_choice":
      valid =
        Array.isArray(value) &&
        value.every(
          (option) =>
            typeof option === "string" && question.options?.includes(option),
        ) &&
        new Set(value).size === value.length;
      break;
    case "scale":
      valid =
        typeof value === "number" &&
        Number.isInteger(value) &&
        value >= (question.config?.min ?? 1) &&
        value <= (question.config?.max ?? 5);
      break;
    case "file_upload":
      valid = /^https?:\/\//i.test(answer?.fileUrl?.trim() ?? "");
      break;
  }
  return valid ? null : `Câu trả lời không hợp lệ: "${question.label}"`;
};
