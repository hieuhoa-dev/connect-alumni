"use server";

import { db } from "@/db";
import {
  forms,
  formQuestions,
  formResponses,
  formAnswers,
  profiles,
} from "@/db/schema";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import {
  formCreateSchema,
  formResponseSubmitSchema,
  FormCreateInput,
  FormResponseSubmitInput,
} from "@/validators/form-schema";
import { logAuditEvent } from "@/lib/audit";

/**
 * Faculty/Admin: Create form with dynamic questions
 */
export const createFormWithQuestions = async (input: FormCreateInput) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validated = formCreateSchema.parse(input);

  // 1. Insert form
  const [newForm] = await db
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
  if (validated.questions && validated.questions.length > 0) {
    const questionValues = validated.questions.map((q, idx) => ({
      formId: newForm.id,
      orderIndex: q.orderIndex ?? idx,
      questionType: q.questionType,
      label: q.label,
      options: q.options || null,
      isRequired: q.isRequired ?? true,
      config: q.config || null,
    }));

    await db.insert(formQuestions).values(questionValues);
  }

  await logAuditEvent({
    actorId: current.user.id,
    action: "create_form",
    entityType: "form",
    entityId: newForm.id,
    metadata: { title: newForm.title, type: newForm.type },
  });

  return newForm;
};

/**
 * Get form details with questions
 */
export const getFormById = async (formId: string) => {
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
      creator: {
        with: {
          profile: true,
        },
      },
    },
  });

  return form;
};

/**
 * Student / Alumni: Get available forms targeted for the current user
 */
export const getAvailableFormsForUser = async () => {
  const current = await getCurrentUser();
  if (!current?.user) return [];

  const userBatch = current.profile?.batchYear;
  const userRole = current.role;

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
  return allForms.filter((f) => {
    // Check role eligibility
    if (f.targetRole !== "all" && f.targetRole !== userRole) {
      return false;
    }

    // Check batch eligibility (NULL or empty array means all batches)
    if (f.targetBatches && f.targetBatches.length > 0) {
      if (!userBatch || !f.targetBatches.includes(userBatch)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Submit answers to a form
 */
export const submitFormResponse = async (input: FormResponseSubmitInput) => {
  const current = await getCurrentUser();
  if (!current?.user) {
    throw new Error("Vui lòng đăng nhập để gửi biểu mẫu");
  }

  const validated = formResponseSubmitSchema.parse(input);

  // Check form status & deadline
  const form = await db.query.forms.findFirst({
    where: {
      id: validated.formId,
    },
  });

  if (!form || form.status !== "open") {
    throw new Error("Biểu mẫu hiện đang đóng hoặc không tồn tại");
  }

  if (form.deadline && new Date() > new Date(form.deadline)) {
    throw new Error("Biểu mẫu đã quá hạn nộp");
  }

  // 1. Create response header
  const [response] = await db
    .insert(formResponses)
    .values({
      formId: validated.formId,
      respondentId: current.user.id,
    })
    .returning();

  // 2. Insert answers
  const answerEntries = Object.entries(validated.answers);
  if (answerEntries.length > 0) {
    const answerValues = answerEntries.map(([questionId, data]) => ({
      responseId: response.id,
      questionId,
      answerValue: data.answerValue !== undefined ? data.answerValue : null,
      fileUrl: data.fileUrl || null,
    }));

    await db.insert(formAnswers).values(answerValues);
  }

  await logAuditEvent({
    actorId: current.user.id,
    action: "submit_form_response",
    entityType: "form_response",
    entityId: response.id,
    metadata: { formId: validated.formId },
  });

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
      .filter(Boolean);

    let summaryData: any = null;

    if (q.questionType === "single_choice" || q.questionType === "multi_choice") {
      const counts: Record<string, number> = {};
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
      summaryData = Object.entries(counts).map(([name, count]) => ({ name, count }));
    } else if (q.questionType === "scale") {
      const numericValues = answersForQ
        .map((a) => Number(a?.answerValue))
        .filter((n) => !isNaN(n));
      const avg =
        numericValues.length > 0
          ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
          : 0;
      summaryData = { average: Number(avg.toFixed(2)), total: numericValues.length };
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
