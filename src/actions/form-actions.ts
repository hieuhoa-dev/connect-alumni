"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { formAnswers, formQuestions, formResponses, forms } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import {
  getCurrentUser,
  requireActiveUser,
  requireRole,
} from "@/lib/permissions";
import {
  type FormCreateInput,
  type FormResponseSubmitInput,
  formCreateSchema,
  formResponseSubmitSchema,
  formQuestionInputSchema,
  formStatusUpdateSchema,
  getFormAnswerError,
  isFormEligible,
} from "@/validators/form-schema";

/**
 * Faculty/Admin: Create form with dynamic questions
 */
export const createFormWithQuestions = async (input: FormCreateInput) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validated = formCreateSchema.parse(input);

  const newForm = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(forms)
      .values({
        type: validated.type,
        title: validated.title,
        description: validated.description,
        targetBatches: validated.targetBatches || null,
        targetRole: validated.targetRole,
        deadline: validated.deadline || null,
        status: validated.status,
        createdBy: current.user.id,
      })
      .returning();

    // 2. Insert questions
    const questionValues = validated.questions.map((q, idx) => ({
      formId: created.id,
      orderIndex: q.orderIndex ?? idx,
      questionType: q.questionType,
      label: q.label,
      options: q.options || null,
      isRequired: q.isRequired ?? true,
      config: q.config || null,
    }));

    await tx.insert(formQuestions).values(questionValues);
    return created;
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: "create_form",
    entityType: "form",
    entityId: newForm.id,
    metadata: { title: newForm.title, type: newForm.type },
  });

  revalidatePath("/faculty-admin/forms");
  revalidatePath("/student/surveys");
  return newForm;
};

/**
 * Get form details with questions
 */
export const getFormById = async (formId: string) => {
  const current = await requireActiveUser();
  if (!formResponseSubmitSchema.shape.formId.safeParse(formId).success)
    return undefined;
  const form = await db.query.forms.findFirst({
    where: {
      id: formId,
    },
    with: {
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
      },
      responses: {
        where: { respondentId: current.user.id },
        with: {
          answers: true,
        },
      },
    },
  });

  if (!form || !isFormEligible(form, current)) return undefined;
  if (
    form.status !== "open" &&
    !form.responses.length &&
    current.role !== "admin" &&
    current.role !== "faculty_staff"
  )
    return undefined;
  return form;
};

/**
 * Student / Alumni: Get available forms targeted for the current user
 */
export const getAvailableFormsForUser = async () => {
  const current = await getCurrentUser();
  if (!current?.user) return [];

  const allForms = await db.query.forms.findMany({
    where: {
      status: "open",
    },
    with: {
      questions: true,
      responses: {
        where: {
          respondentId: current.user.id,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Filter based on target_batches and target_role
  return allForms.filter((f) => isFormEligible(f, current));
};

/**
 * Submit answers to a form
 */
export const submitFormResponse = async (input: FormResponseSubmitInput) => {
  // Người dùng bị khóa không được gửi biểu mẫu
  const current = await requireActiveUser();

  const validated = formResponseSubmitSchema.parse(input);

  // Check form status & deadline
  const form = await db.query.forms.findFirst({
    where: {
      id: validated.formId,
    },
    with: {
      questions: true,
    },
  });

  if (!form || form.status !== "open") {
    throw new Error("Biểu mẫu hiện đang đóng hoặc không tồn tại");
  }

  if (form.deadline && new Date() > new Date(form.deadline)) {
    throw new Error("Biểu mẫu đã quá hạn nộp");
  }

  // Đối tượng được phép trả lời biểu mẫu
  if (!isFormEligible(form, current)) {
    throw new Error("Biểu mẫu này không dành cho vai trò hoặc khóa của bạn");
  }

  // Câu hỏi gửi lên phải thuộc biểu mẫu này
  const validQuestionIds = new Set(form.questions.map((q) => q.id));
  const answerEntries = Object.entries(validated.answers).filter(
    ([questionId]) => validQuestionIds.has(questionId),
  );
  if (answerEntries.length !== Object.keys(validated.answers).length) {
    throw new Error("Câu trả lời có chứa câu hỏi không thuộc biểu mẫu");
  }

  // Câu hỏi bắt buộc phải có câu trả lời
  for (const question of form.questions) {
    const error = getFormAnswerError(question, validated.answers[question.id]);
    if (error) throw new Error(error);
  }

  // Phản hồi + câu trả lời ghi trong một transaction; unique (formId, respondentId) chặn nộp trùng
  const response = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(formResponses)
      .values({
        formId: validated.formId,
        respondentId: current.user.id,
      })
      .onConflictDoNothing()
      .returning();

    if (!created) {
      throw new Error("Bạn đã gửi phản hồi cho biểu mẫu này rồi");
    }

    if (answerEntries.length > 0) {
      await tx.insert(formAnswers).values(
        answerEntries.map(([questionId, data]) => ({
          responseId: created.id,
          questionId,
          answerValue: data.answerValue !== undefined ? data.answerValue : null,
          fileUrl: data.fileUrl || null,
        })),
      );
    }

    return created;
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: "submit_form_response",
    entityType: "form_response",
    entityId: response.id,
    metadata: { formId: validated.formId },
  });

  revalidatePath("/student/surveys");
  revalidatePath(`/student/surveys/${validated.formId}`);
  revalidatePath(`/faculty-admin/forms/${validated.formId}/responses`);
  return response;
};

/**
 * Faculty/Admin: Get form responses with aggregated charts and statistics
 */
export const getFormResponsesAndAnalytics = async (formId: string) => {
  await requireRole(["faculty_staff", "admin"]);

  const form = await db.query.forms.findFirst({
    where: {
      id: formId,
    },
    with: {
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
      },
      responses: {
        with: {
          respondent: {
            with: {
              profile: true,
            },
          },
          answers: true,
        },
        orderBy: {
          submittedAt: "desc",
        },
      },
    },
  });

  if (!form) {
    throw new Error("Không tìm thấy biểu mẫu");
  }

  // Aggregate questions analytics
  const analytics = form.questions.map((q) => {
    const answersForQ = form.responses
      .map((r) => r.answers.find((a) => a.questionId === q.id))
      .filter(
        (answer) =>
          answer &&
          getFormAnswerError({ ...q, isRequired: true }, answer) === null,
      );

    let summaryData:
      | { name: string; count: number }[]
      | { average: number; total: number }
      | null = null;

    if (
      q.questionType === "single_choice" ||
      q.questionType === "multi_choice"
    ) {
      const counts: Record<string, number> = Object.fromEntries(
        (q.options ?? []).map((option) => [option, 0]),
      );
      answersForQ.forEach((a) => {
        const val = a?.answerValue;
        if (Array.isArray(val)) {
          val.forEach((item) => {
            counts[item] = (counts[item] || 0) + 1;
          });
        } else if (typeof val === "string") {
          counts[val] = (counts[val] || 0) + 1;
        }
      });
      summaryData = Object.entries(counts).map(([name, count]) => ({
        name,
        count,
      }));
    } else if (q.questionType === "scale") {
      const numericValues = answersForQ
        .map((a) => a?.answerValue as number)
        .filter((n) => typeof n === "number" && Number.isFinite(n));
      const avg =
        numericValues.length > 0
          ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
          : 0;
      summaryData = {
        average: Number(avg.toFixed(2)),
        total: numericValues.length,
      };
    }

    return {
      questionId: q.id,
      label: q.label,
      questionType: q.questionType,
      options: q.options,
      totalAnswers: answersForQ.length,
      summaryData,
    };
  });

  return {
    form,
    totalResponses: form.responses.length,
    analytics,
  };
};

/**
 * Faculty/Admin: Get all forms
 */
export const getFormsForFaculty = async () => {
  await requireRole(["faculty_staff", "admin"]);

  return await db.query.forms.findMany({
    with: {
      questions: true,
      responses: true,
      creator: {
        with: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateFormStatus = async (input: { formId: string; status: "draft" | "open" | "closed" }) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validated = formStatusUpdateSchema.parse(input);
  const form = await db.query.forms.findFirst({ where: { id: validated.formId }, with: { questions: true } });
  if (!form) throw new Error("Không tìm thấy biểu mẫu");
  if (validated.status === "open") {
    if (form.deadline && form.deadline <= new Date()) throw new Error("Biểu mẫu đã quá hạn nhận phản hồi");
    if (!form.questions.length || form.questions.some((question) => !formQuestionInputSchema.safeParse(question).success)) throw new Error("Vui lòng hoàn thiện câu hỏi trước khi mở biểu mẫu");
  }
  const [updated] = await db.update(forms).set({ status: validated.status }).where(eq(forms.id, validated.formId)).returning();
  if (!updated) throw new Error("Không tìm thấy biểu mẫu");
  await logAuditEvent({ actorId: current.user.id, action: `update_form_status_${validated.status}`, entityType: "form", entityId: validated.formId });
  revalidatePath("/faculty-admin/forms");
  revalidatePath("/student/surveys");
  revalidatePath(`/student/surveys/${validated.formId}`);
  return updated;
};
