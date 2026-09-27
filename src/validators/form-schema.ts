import { z } from "zod";

export const formQuestionInputSchema = z.object({
  id: z.string().optional(),
  orderIndex: z.number().int(),
  questionType: z.enum([
    "short_text",
    "long_text",
    "single_choice",
    "multi_choice",
    "scale",
    "file_upload",
  ]),
  label: z.string().min(1, "Nội dung câu hỏi không được để trống"),
  options: z.array(z.string()).optional().nullable(),
  isRequired: z.boolean().default(true),
  config: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      minLabel: z.string().optional(),
      maxLabel: z.string().optional(),
      allowedFileTypes: z.array(z.string()).optional(),
      maxFileSizeMb: z.number().optional(),
    })
    .optional()
    .nullable(),
});

export const formCreateSchema = z.object({
  type: z.enum(["survey", "scholarship_application", "event_feedback", "other"]),
  title: z.string().min(3, "Tiêu đề form ít nhất 3 ký tự"),
  description: z.string().min(5, "Mô tả form ít nhất 5 ký tự"),
  targetBatches: z.array(z.coerce.number().int()).optional().nullable(),
  targetRole: z.enum(["student", "alumni", "all"]).default("all"),
  deadline: z.string().or(z.date()).optional().nullable().transform((val) => (val ? new Date(val) : null)),
  status: z.enum(["draft", "open", "closed"]).default("open"),
  questions: z.array(formQuestionInputSchema).min(1, "Form phải có ít nhất 1 câu hỏi"),
});

export const formResponseSubmitSchema = z.object({
  formId: z.string().uuid("ID form không hợp lệ"),
  answers: z.record(
    z.string(), // questionId
    z.object({
      answerValue: z.any().optional(),
      fileUrl: z.string().optional().nullable(),
    }),
  ),
});

export type FormCreateInput = z.infer<typeof formCreateSchema>;
export type FormQuestionInput = z.infer<typeof formQuestionInputSchema>;
export type FormResponseSubmitInput = z.infer<typeof formResponseSubmitSchema>;
