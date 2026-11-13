import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forms, formQuestions, formResponses, formAnswers, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/lib/audit";

export const POST = async (req: NextRequest) => {
  try {
    const secretHeader = req.headers.get("x-webhook-secret");
    const body = await req.json();
    const { formId, respondentEmail, submittedAt, answers } = body;

    if (!formId) {
      return NextResponse.json(
        { error: "Thiếu thông tin formId" },
        { status: 400 },
      );
    }

    // 1. Tìm thông tin form
    const currentForm = await db.query.forms.findFirst({
      where: {
        id: formId,
      },
      with: {
        questions: true,
      },
    });

    if (!currentForm) {
      return NextResponse.json(
        { error: "Không tìm thấy form tương ứng trên hệ thống" },
        { status: 404 },
      );
    }

    // 2. Xác thực secret nếu form có cài secret
    if (currentForm.webhookSecret) {
      if (secretHeader !== currentForm.webhookSecret) {
        return NextResponse.json(
          { error: "Xác thực x-webhook-secret thất bại" },
          { status: 401 },
        );
      }
    }

    // 3. Tìm người nộp trong hệ thống theo email (nếu có)
    let respondentId = currentForm.createdBy; // fallback nếu người dùng chưa tạo tài khoản

    if (respondentEmail && typeof respondentEmail === "string") {
      const matchedUser = await db.query.user.findFirst({
        where: {
          email: respondentEmail.trim().toLowerCase(),
        },
      });
      if (matchedUser) {
        respondentId = matchedUser.id;
      }
    }

    // 4. Tạo bản ghi form response
    const [newResponse] = await db
      .insert(formResponses)
      .values({
        formId: currentForm.id,
        respondentId,
        submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      })
      .returning();

    // 5. Đồng bộ câu hỏi và lưu câu trả lời
    if (Array.isArray(answers) && answers.length > 0) {
      // Map câu hỏi hiện có theo tiêu đề (label)
      const existingQuestionsMap = new Map<string, string>();
      const existingQuestions = (currentForm as any).questions || [];
      existingQuestions.forEach((q: any) => {
        existingQuestionsMap.set(q.label.trim().toLowerCase(), q.id);
      });

      const answersToInsert: Array<{
        responseId: string;
        questionId: string;
        answerValue: any;
      }> = [];

      for (let i = 0; i < answers.length; i++) {
        const item = answers[i];
        const questionTitle = (item.question || `Câu hỏi ${i + 1}`).trim();
        const key = questionTitle.toLowerCase();

        let questionId = existingQuestionsMap.get(key);

        // Nếu câu hỏi chưa tồn tại trong DB, tự động khởi tạo để liên kết câu trả lời
        if (!questionId) {
          const [insertedQuestion] = await db
            .insert(formQuestions)
            .values({
              formId: currentForm.id,
              orderIndex: i,
              questionType: "long_text",
              label: questionTitle,
              isRequired: false,
            })
            .returning();

          questionId = insertedQuestion.id;
          existingQuestionsMap.set(key, questionId);
        }

        answersToInsert.push({
          responseId: newResponse.id,
          questionId,
          answerValue: {
            value: item.answer,
            respondentEmail: respondentEmail || null,
          },
        });
      }

      if (answersToInsert.length > 0) {
        await db.insert(formAnswers).values(answersToInsert);
      }
    }

    await logAuditEvent({
      actorId: respondentId,
      action: "google_form_webhook_submit",
      entityType: "form_response",
      entityId: newResponse.id,
      metadata: {
        formId: currentForm.id,
        respondentEmail: respondentEmail || null,
        answersCount: answers?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã ghi nhận kết quả khảo sát từ Google Form thành công",
      responseId: newResponse.id,
    });
  } catch (error: any) {
    console.error("Lỗi xử lý webhook Google Form:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi máy chủ nội bộ" },
      { status: 500 },
    );
  }
};
