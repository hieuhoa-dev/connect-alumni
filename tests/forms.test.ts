import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as validators from "../src/validators/form-schema";

const formId = "11111111-1111-4111-8111-111111111111";
const questionId = "22222222-2222-4222-8222-222222222222";
const question = {
  id: questionId,
  questionType: "short_text",
  label: "Họ tên",
  isRequired: true,
  options: null,
  config: null,
};
const validForm = {
  type: "survey",
  title: "Khảo sát",
  description: "Khảo sát sinh viên",
  targetRole: "student",
  targetBatches: [2022],
  questions: [{ ...question, orderIndex: 0 }],
};

const loadActions = (db: unknown, role = "student", batchYear = 2022) => {
  const current = { user: { id: "student-1" }, role, profile: { batchYear } };
  const requireModule = createRequire(path.join(process.cwd(), "package.json"));
  const dependencies: Record<string, unknown> = {
    "@/db": { db },
    "@/db/schema": {
      forms: "forms",
      formQuestions: "questions",
      formResponses: "responses",
      formAnswers: "answers",
    },
    "@/lib/permissions": {
      requireActiveUser: async () => current,
      requireRole: async () => current,
      getCurrentUser: async () => current,
    },
    "@/lib/audit": { logAuditEvent: async () => undefined },
    "@/validators/form-schema": validators,
    "next/cache": { revalidatePath: () => undefined },
  };
  const code = ts.transpileModule(
    readFileSync("src/actions/form-actions.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const module = { exports: {} };
  const execute = runInNewContext(
    `(function(module, exports, require) { ${code}\n })`,
  );
  execute(
    module,
    module.exports,
    (id: string) => dependencies[id] ?? requireModule(id),
  );
  return module.exports as typeof import("../src/actions/form-actions");
};

test("forms reject invalid deadlines and whitespace labels", () => {
  assert.equal(
    validators.formCreateSchema.safeParse({
      ...validForm,
      deadline: "not-a-date",
    }).success,
    false,
  );
  assert.equal(
    validators.formCreateSchema.safeParse({
      ...validForm,
      questions: [{ ...validForm.questions[0], label: "  " }],
    }).success,
    false,
  );
});

test("choice questions reject empty and duplicate options after trimming", () => {
  for (const options of [[], [" "], ["Đồng ý", " Đồng ý "]]) {
    assert.equal(
      validators.formQuestionInputSchema.safeParse({
        ...validForm.questions[0],
        questionType: "single_choice",
        options,
      }).success,
      false,
    );
  }
});

test("scale configuration rejects inverted, fractional and oversized ranges", () => {
  for (const config of [
    { min: 5, max: 1 },
    { min: 1.5, max: 5 },
    { min: 1, max: 1000 },
  ]) {
    assert.equal(
      validators.formQuestionInputSchema.safeParse({
        ...validForm.questions[0],
        questionType: "scale",
        config,
      }).success,
      false,
    );
  }
});

test("form eligibility enforces role and batch consistently", () => {
  const form = { targetRole: "student", targetBatches: [2022] };
  assert.equal(
    validators.isFormEligible(form, {
      role: "student",
      profile: { batchYear: 2021 },
    }),
    false,
  );
  assert.equal(
    validators.isFormEligible(form, {
      role: "alumni",
      profile: { batchYear: 2022 },
    }),
    false,
  );
  assert.equal(
    validators.isFormEligible(form, {
      role: "student",
      profile: { batchYear: 2022 },
    }),
    true,
  );
  assert.equal(
    validators.isFormEligible(form, { role: "faculty_staff" }),
    true,
  );
});

test("file URLs cannot satisfy required text questions or use script schemes", () => {
  assert.ok(
    validators.getFormAnswerError(question, {
      fileUrl: "https://example.com/proof.pdf",
    }),
  );
  assert.equal(
    validators.formResponseSubmitSchema.safeParse({
      formId,
      answers: { [questionId]: { fileUrl: "javascript:alert(1)" } },
    }).success,
    false,
  );
});

test("answers must match configured choices and scale bounds", () => {
  assert.ok(
    validators.getFormAnswerError(
      { ...question, questionType: "single_choice", options: ["Đồng ý"] },
      { answerValue: "Không tồn tại" },
    ),
  );
  assert.ok(
    validators.getFormAnswerError(
      { ...question, questionType: "multi_choice", options: ["Đồng ý"] },
      { answerValue: ["Đồng ý", "Đồng ý"] },
    ),
  );
  assert.ok(
    validators.getFormAnswerError(
      { ...question, questionType: "scale" },
      { answerValue: 6 },
    ),
  );
  assert.equal(
    validators.getFormAnswerError(
      { ...question, questionType: "scale", config: { min: 0, max: 5 } },
      { answerValue: 0 },
    ),
    null,
  );
});

test("form submission rejects callers outside its batch before writing", async () => {
  let writes = 0;
  const actions = loadActions(
    {
      query: {
        forms: {
          findFirst: async () => ({
            ...validForm,
            id: formId,
            status: "open",
            deadline: null,
            questions: [question],
          }),
        },
      },
      transaction: async () => {
        writes++;
      },
    },
    "student",
    2021,
  );
  await assert.rejects(
    actions.submitFormResponse({
      formId,
      answers: { [questionId]: { answerValue: "Nguyễn Minh Anh" } },
    }),
    /vai trò hoặc khóa/,
  );
  assert.equal(writes, 0);
});

test("form creation writes metadata and questions through the same transaction", async () => {
  const writes: string[] = [];
  const tx = {
    insert: (table: string) => ({
      values: () => {
        writes.push(table);
        return { returning: async () => [{ ...validForm, id: formId }] };
      },
    }),
  };
  const actions = loadActions(
    {
      transaction: async (work: (transaction: typeof tx) => Promise<unknown>) =>
        work(tx),
    },
    "faculty_staff",
  );
  await actions.createFormWithQuestions(
    validators.formCreateSchema.parse(validForm),
  );
  assert.deepEqual(writes, ["forms", "questions"]);
});

test("form detail denies ineligible access and scopes response reads to the caller", async () => {
  let responseFilter: unknown;
  const actions = loadActions(
    {
      query: {
        forms: {
          findFirst: async (query: {
            with: { responses: { where: unknown } };
          }) => {
            responseFilter = query.with.responses.where;
            return { ...validForm, id: formId, status: "open", responses: [] };
          },
        },
      },
    },
    "student",
    2021,
  );
  assert.equal(await actions.getFormById(formId), undefined);
  assert.equal(
    JSON.stringify(responseFilter),
    JSON.stringify({ respondentId: "student-1" }),
  );
});

test("form submission rejects unknown single-choice values before writing", async () => {
  let writes = 0;
  const actions = loadActions({
    query: {
      forms: {
        findFirst: async () => ({
          ...validForm,
          id: formId,
          status: "open",
          deadline: null,
          questions: [
            { ...question, questionType: "single_choice", options: ["Đồng ý"] },
          ],
        }),
      },
    },
    transaction: async () => {
      writes++;
    },
  });
  await assert.rejects(
    actions.submitFormResponse({
      formId,
      answers: { [questionId]: { answerValue: "Không tồn tại" } },
    }),
    /không hợp lệ/,
  );
  assert.equal(writes, 0);
});

test("analytics excludes unanswered optional scales and retains valid zero ratings", async () => {
  const scale = {
    ...question,
    questionType: "scale",
    isRequired: false,
    config: { min: 0, max: 5 },
  };
  const responses = [null, 0, 4].map((answerValue) => ({
    answers: [{ questionId, answerValue }],
  }));
  const actions = loadActions(
    {
      query: {
        forms: { findFirst: async () => ({ questions: [scale], responses }) },
      },
    },
    "faculty_staff",
  );
  const result = await actions.getFormResponsesAndAnalytics(formId);
  assert.equal(result.analytics[0].totalAnswers, 2);
  assert.equal(
    (result.analytics[0].summaryData as { average: number }).average,
    2,
  );
});
