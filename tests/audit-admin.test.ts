import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

type Role = "student" | "alumni" | "employer" | "faculty_staff" | "admin";
type Permissions = typeof import("../src/lib/permissions");
type NewsActions = typeof import("../src/actions/news-actions");
type ContactActions = typeof import("../src/actions/contact-actions");
type FormActions = typeof import("../src/actions/form-actions");
type AuthActions = typeof import("../src/actions/auth-actions");
type AnalyticsActions = typeof import("../src/actions/analytics-actions");
type AuditActions = typeof import("../src/actions/audit-actions");
const requireModule = createRequire(path.join(process.cwd(), "package.json"));
const entityId = "11111111-1111-4111-8111-111111111111";

const loadSource = <T>(
  file: string,
  dependencies: Record<string, unknown>,
): T => {
  const output = ts.transpileModule(readFileSync(path.resolve(file), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const sourceModule = { exports: {} };
  const execute = runInNewContext(
    `(function(module, exports, require) { ${output}\n })`,
    { console, Date, URL, Headers, Error },
  ) as (
    module: typeof sourceModule,
    exports: object,
    require: (id: string) => unknown,
  ) => void;
  execute(sourceModule, sourceModule.exports, (id) => {
    if (id in dependencies) return dependencies[id];
    return requireModule(
      id.startsWith("@/")
        ? path.resolve("src", id.slice(2))
        : id.startsWith(".")
          ? path.resolve(path.dirname(path.resolve(file)), id)
          : id,
    );
  });
  return sourceModule.exports as T;
};

// Exercise the production permission guards with an isolated authenticated session.
// Actions use a separate mock database so rejection must happen before any access.
const createScope = (
  role: Role,
  status: "active" | "locked" = "active",
  hasProfile = true,
  authenticated = true,
) => {
  const auth = {
    api: {
      getSession: async () =>
        authenticated ? { user: { id: "actor-1" } } : null,
    },
  };
  const permissions = loadSource<Permissions>("src/lib/permissions.ts", {
    "next/headers": { headers: async () => new Headers() },
    "next/navigation": {
      redirect: (route: string) => {
        throw new Error(`REDIRECT:${route}`);
      },
    },
    "@/lib/auth": { auth },
    "@/db": {
      db: {
        select: () => ({
          from: () => ({
            where: async () =>
              hasProfile ? [{ userId: "actor-1", role, status }] : [],
          }),
        }),
      },
    },
  });
  const auditEvents: Record<string, unknown>[] = [];
  const revalidated: string[] = [];
  const dependencies = (db: unknown) => ({
    "@/db": { db },
    "@/lib/permissions": permissions,
    "@/lib/auth": { auth },
    "@/lib/audit": {
      logAuditEvent: async (event: Record<string, unknown>) => {
        auditEvents.push(event);
        return null;
      },
    },
    "next/cache": {
      revalidatePath: (route: string) => revalidated.push(route),
    },
    "next/headers": { headers: async () => new Headers() },
  });
  return { dependencies, auditEvents, revalidated };
};

const newsInput = {
  title: "Ngày hội kết nối cộng đồng",
  content:
    "<p>Sinh viên và cựu sinh viên cùng chia sẻ kinh nghiệm học tập.</p>",
  category: "connect" as const,
  status: "published" as const,
};
const formInput = {
  type: "survey" as const,
  title: "Khảo sát cộng đồng",
  description: "Góp ý cải thiện hoạt động kết nối",
  targetRole: "all" as const,
  status: "open" as const,
  deadline: null,
  questions: [
    {
      orderIndex: 0,
      questionType: "short_text" as const,
      label: "Bạn muốn tham gia hoạt động nào?",
      isRequired: true,
    },
  ],
};

test("student, alumni and employer cannot read or mutate staff/admin modules through server actions", async () => {
  for (const role of ["student", "alumni", "employer"] as const) {
    const scope = createScope(role);
    const db = new Proxy(
      {},
      {
        get: () => {
          throw new Error("Protected database touched");
        },
      },
    );
    const news = loadSource<NewsActions>(
      "src/actions/news-actions.ts",
      scope.dependencies(db),
    );
    const contact = loadSource<ContactActions>(
      "src/actions/contact-actions.ts",
      scope.dependencies(db),
    );
    const forms = loadSource<FormActions>(
      "src/actions/form-actions.ts",
      scope.dependencies(db),
    );
    const auth = loadSource<AuthActions>(
      "src/actions/auth-actions.ts",
      scope.dependencies(db),
    );
    const analytics = loadSource<AnalyticsActions>(
      "src/actions/analytics-actions.ts",
      scope.dependencies(db),
    );
    const audit = loadSource<AuditActions>(
      "src/actions/audit-actions.ts",
      scope.dependencies(db),
    );
    const protectedCalls = [
      () => news.getNewsForStaff(),
      () => news.createNews(newsInput),
      () => news.updateNews(entityId, newsInput),
      () => news.setNewsStatus(entityId, "published"),
      () => news.setNewsPinned(entityId, true),
      () => news.deleteNews(entityId),
      () => contact.getContactMessages(),
      () => contact.setContactMessageRead(entityId, true),
      () => contact.deleteContactMessage(entityId),
      () => forms.getFormsForFaculty(),
      () => forms.getFormResponsesAndAnalytics(entityId),
      () => forms.createFormWithQuestions(formInput),
      () => forms.updateFormStatus({ formId: entityId, status: "closed" }),
      () => auth.adminGetUsers(),
      () => auth.adminUpdateUserRole("target-1", "admin"),
      () => auth.adminToggleUserLock("target-1", true),
      () => analytics.getFacultyDashboardAnalytics(),
      () => audit.getAuditLogs(),
    ];
    for (const call of protectedCalls)
      await assert.rejects(call, /Yêu cầu quyền/);
    assert.equal(scope.auditEvents.length, 0);
  }
});

test("staff cannot grant roles, lock accounts or read either admin audit endpoint", async () => {
  const scope = createScope("faculty_staff");
  const db = new Proxy(
    {},
    {
      get: () => {
        throw new Error("Admin database touched");
      },
    },
  );
  const auth = loadSource<AuthActions>(
    "src/actions/auth-actions.ts",
    scope.dependencies(db),
  );
  const audit = loadSource<AuditActions>(
    "src/actions/audit-actions.ts",
    scope.dependencies(db),
  );
  const analytics = loadSource<AnalyticsActions>(
    "src/actions/analytics-actions.ts",
    scope.dependencies(db),
  );
  for (const call of [
    () => auth.adminGetUsers(),
    () => auth.adminUpdateUserRole("target-1", "admin"),
    () => auth.adminToggleUserLock("target-1", true),
    () => audit.getAuditLogs(),
    () => analytics.getAuditLogs(),
  ])
    await assert.rejects(call, /Yêu cầu quyền/);
});

test("locked staff and admins cannot invoke protected mutations or read unpublished news", async () => {
  for (const role of ["faculty_staff", "admin"] as const) {
    const scope = createScope(role, "locked");
    const db = {
      query: {
        newsArticles: {
          findFirst: async () => ({ id: entityId, status: "draft" }),
        },
      },
    };
    const news = loadSource<NewsActions>(
      "src/actions/news-actions.ts",
      scope.dependencies(db),
    );
    const contact = loadSource<ContactActions>(
      "src/actions/contact-actions.ts",
      scope.dependencies(db),
    );
    const forms = loadSource<FormActions>(
      "src/actions/form-actions.ts",
      scope.dependencies(db),
    );
    const auth = loadSource<AuthActions>(
      "src/actions/auth-actions.ts",
      scope.dependencies(db),
    );
    const analytics = loadSource<AnalyticsActions>(
      "src/actions/analytics-actions.ts",
      scope.dependencies(db),
    );
    for (const call of [
      () => news.createNews(newsInput),
      () => contact.deleteContactMessage(entityId),
      () => forms.updateFormStatus({ formId: entityId, status: "open" }),
      () => auth.adminUpdateUserRole("target-1", "admin"),
      () => analytics.getFacultyDashboardAnalytics(),
    ])
      await assert.rejects(call, /đã bị khóa/);
    assert.equal(await news.getNewsById(entityId), null);
  }
});

test("dashboard staff analytics never query the admin audit stream; admins retain access", async () => {
  for (const role of ["faculty_staff", "admin"] as const) {
    const scope = createScope(role);
    let auditQueries = 0;
    const logs = [
      {
        id: entityId,
        action: "change_user_role",
        entityType: "user",
        entityId,
        createdAt: new Date("2026-10-01T02:00:00Z"),
        metadata: { newRole: "admin" },
      },
    ];
    const rows = [
      { val: 0, totalTarget: "0", totalFulfilled: "0", totalPledged: "0" },
    ];
    type QueryBuilder = Promise<typeof rows> & {
      where: (condition: SQL) => QueryBuilder;
      innerJoin: (table: unknown, condition: unknown) => QueryBuilder;
      groupBy: (column: unknown) => Promise<never[]>;
    };
    const conditions: SQL[] = [];
    const queryBuilder: QueryBuilder = Object.assign(Promise.resolve(rows), {
      where: (condition: SQL) => {
        conditions.push(condition);
        return queryBuilder;
      },
      innerJoin: (_table: unknown, _condition: unknown) => queryBuilder,
      groupBy: (_column: unknown) => Promise.resolve([]),
    });
    const analytics = loadSource<AnalyticsActions>(
      "src/actions/analytics-actions.ts",
      scope.dependencies({
        select: () => ({ from: () => queryBuilder }),
        query: {
          auditLogs: {
            findMany: async () => {
              auditQueries++;
              return logs;
            },
          },
        },
      }),
    );
    const data = await analytics.getFacultyDashboardAnalytics();
    assert.equal(data.canViewAuditLogs, role === "admin");
    assert.equal(auditQueries, role === "admin" ? 1 : 0);
    assert.equal(data.recentLogs.length, role === "admin" ? 1 : 0);
    const publicJobsQuery = conditions
      .map((condition) => new PgDialect().sqlToQuery(condition))
      .find(
        (query) =>
          query.params.includes("approved") &&
          query.params.includes("verified"),
      );
    assert.ok(
      publicJobsQuery,
      "Public jobs count must require a verified company",
    );
    assert.ok(publicJobsQuery.sql.includes('"expires_at" >'));
    const page = loadSource<{ default: () => Promise<ReactElement> }>(
      "src/app/faculty-admin/dashboard/page.tsx",
      {
        "@/actions/analytics-actions": {
          getFacultyDashboardAnalytics: async () => data,
        },
        "./analytics-charts": { AnalyticsCharts: () => null },
      },
    );
    const html = renderToStaticMarkup(await page.default());
    assert.equal(html.includes("/faculty-admin/audit-logs"), role === "admin");
    assert.equal(html.includes("change_user_role"), role === "admin");
  }
});

test("active staff and admins can publish sanitized news and reuse the first publication date", async () => {
  const originalDate = new Date("2026-10-01T02:00:00Z");
  for (const role of ["faculty_staff", "admin"] as const) {
    const scope = createScope(role);
    const stored: Record<string, unknown>[] = [];
    const write = (values: Record<string, unknown>) => {
      stored.push(values);
      return { returning: async () => [{ id: entityId, ...values }] };
    };
    const news = loadSource<NewsActions>(
      "src/actions/news-actions.ts",
      scope.dependencies({
        query: {
          newsArticles: {
            findFirst: async () => ({
              id: entityId,
              publishedAt: originalDate,
              content: newsInput.content,
              status: "published",
            }),
          },
        },
        insert: () => ({ values: write }),
        update: () => ({
          set: (values: Record<string, unknown>) => ({
            where: () => write(values),
          }),
        }),
      }),
    );
    await news.createNews({
      ...newsInput,
      content: `${newsInput.content}<script>alert(1)</script>`,
    });
    assert.equal(stored[0].authorId, "actor-1");
    assert.equal(stored[0].status, "published");
    assert.ok(!String(stored[0].content).includes("script"));
    await news.setNewsStatus(entityId, "draft");
    await news.setNewsStatus(entityId, "published");
    assert.equal(stored[1].publishedAt, originalDate);
    assert.equal(stored[2].publishedAt, originalDate);
    assert.ok(scope.revalidated.includes("/faculty-admin/news"));
  }
});

test("news rejects markup-only content and cannot pin an unpublished or concurrently removed article", async () => {
  const scope = createScope("faculty_staff");
  let writes = 0;
  const news = loadSource<NewsActions>(
    "src/actions/news-actions.ts",
    scope.dependencies({
      insert: () => {
        writes++;
        throw new Error("Unexpected insert");
      },
      update: () => ({
        set: () => ({
          where: (condition: SQL) => {
            const query = new PgDialect().sqlToQuery(condition);
            assert.ok(query.params.includes("published"));
            writes++;
            return { returning: async () => [] };
          },
        }),
      }),
    }),
  );
  await assert.rejects(
    () =>
      news.createNews({
        ...newsInput,
        content: "<p><strong> </strong><br /></p>",
      }),
    /20 ký tự hiển thị/,
  );
  assert.equal(writes, 0);
  await assert.rejects(() => news.setNewsPinned(entityId, true), /Chỉ ghim/);
  assert.equal(writes, 1);
  assert.equal(scope.auditEvents.length, 0);
});

test("invalid contact and news mutation IDs and non-boolean flags fail before database access", async () => {
  const scope = createScope("admin");
  const db = new Proxy(
    {},
    {
      get: () => {
        throw new Error("Invalid data reached database");
      },
    },
  );
  const contact = loadSource<ContactActions>(
    "src/actions/contact-actions.ts",
    scope.dependencies(db),
  );
  const news = loadSource<NewsActions>(
    "src/actions/news-actions.ts",
    scope.dependencies(db),
  );
  for (const call of [
    () => contact.setContactMessageRead("invalid", true),
    () => contact.deleteContactMessage("invalid"),
    () => contact.setContactMessageRead(entityId, "true" as unknown as boolean),
    () => news.updateNews("invalid", newsInput),
    () => news.setNewsStatus("invalid", "published"),
    () => news.setNewsPinned("invalid", true),
    () => news.setNewsPinned(entityId, "false" as unknown as boolean),
    () => news.deleteNews("invalid"),
  ])
    await assert.rejects(call, /không hợp lệ|Invalid input/);
});

test("contact reads and removals refresh management and record deletion for staff/admin", async () => {
  for (const role of ["faculty_staff", "admin"] as const) {
    const scope = createScope(role);
    const contact = loadSource<ContactActions>(
      "src/actions/contact-actions.ts",
      scope.dependencies({
        update: () => ({
          set: (values: { isRead: boolean }) => ({
            where: () => ({
              returning: async () => [{ id: entityId, ...values }],
            }),
          }),
        }),
        delete: () => ({
          where: () => ({ returning: async () => [{ id: entityId }] }),
        }),
      }),
    );
    const result = await contact.setContactMessageRead(entityId, true);
    assert.equal(result.isRead, true);
    await contact.deleteContactMessage(entityId);
    assert.deepEqual(scope.revalidated, [
      "/faculty-admin/contact",
      "/faculty-admin/contact",
    ]);
    assert.equal(scope.auditEvents[0]?.action, "delete_contact_message");
  }
});

test("staff cannot create an already-expired open form, while a draft can be saved for completion", async () => {
  const scope = createScope("faculty_staff");
  let transactions = 0;
  const forms = loadSource<FormActions>(
    "src/actions/form-actions.ts",
    scope.dependencies({
      transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
        transactions++;
        return callback({
          insert: () => ({
            values: (values: unknown) => ({
              returning: async () => [{ id: entityId, ...(values as object) }],
            }),
          }),
        });
      },
    }),
  );
  const deadline = new Date(Date.now() - 60_000);
  await assert.rejects(
    () => forms.createFormWithQuestions({ ...formInput, deadline }),
    /quá hạn/,
  );
  assert.equal(transactions, 0);
  await forms.createFormWithQuestions({
    ...formInput,
    deadline,
    status: "draft",
  });
  assert.equal(transactions, 1);
});

test("locked and missing profiles cannot read targeted available forms", async () => {
  for (const scope of [
    createScope("student", "locked"),
    createScope("alumni", "active", false),
  ]) {
    const forms = loadSource<FormActions>(
      "src/actions/form-actions.ts",
      scope.dependencies(
        new Proxy(
          {},
          {
            get: () => {
              throw new Error("Private forms database touched");
            },
          },
        ),
      ),
    );
    assert.equal((await forms.getAvailableFormsForUser()).length, 0);
  }
});

test("form submission stops at the exact deadline before any response transaction", async (context) => {
  const now = Date.parse("2026-10-13T03:00:00Z");
  context.mock.timers.enable({ apis: ["Date"], now });
  const scope = createScope("student");
  const forms = loadSource<FormActions>(
    "src/actions/form-actions.ts",
    scope.dependencies({
      query: {
        forms: {
          findFirst: async () => ({
            id: entityId,
            status: "open",
            deadline: new Date(now),
            questions: [],
          }),
        },
      },
      transaction: () => {
        throw new Error("Expired form reached transaction");
      },
    }),
  );
  await assert.rejects(
    () => forms.submitFormResponse({ formId: entityId, answers: {} }),
    /quá hạn/,
  );
});

test("review pages retain rejected, expired and paused records without presenting paused jobs as public", async () => {
  const expiresAt = new Date("2026-12-31T03:00:00Z");
  const jobs = [
    {
      id: "visible-job",
      status: "approved",
      title: "Visible opportunity",
      expiresAt,
      company: { name: "Verified partner", verificationStatus: "verified" },
    },
    {
      id: "paused-job",
      status: "approved",
      title: "Paused opportunity",
      expiresAt,
      company: { name: "Unverified partner", verificationStatus: "rejected" },
    },
    {
      id: "rejected-job",
      status: "rejected",
      title: "Rejected opportunity",
      expiresAt,
      rejectedReason: "Thiếu thông tin lương",
      company: { name: "Partner" },
    },
    {
      id: "expired-job",
      status: "expired",
      title: "Expired opportunity",
      expiresAt,
      company: { name: "Partner" },
    },
  ];
  const jobPage = loadSource<{ default: () => Promise<ReactElement> }>(
    "src/app/faculty-admin/jobs/review/page.tsx",
    {
      "@/actions/job-actions": { getJobsForFacultyReview: async () => jobs },
      "./job-review-actions": { JobReviewActions: () => null },
    },
  );
  const jobsHtml = renderToStaticMarkup(await jobPage.default());
  for (const job of jobs) assert.ok(jobsHtml.includes(job.title));
  assert.ok(jobsHtml.includes("Tin đang mở hiển thị (1)"));
  assert.ok(jobsHtml.includes("Lịch sử xử lý và tin tạm ẩn (3)"));
  assert.ok(jobsHtml.includes("Thiếu thông tin lương"));
  assert.ok(jobsHtml.includes('href="/jobs/visible-job"'));
  assert.ok(!jobsHtml.includes('href="/jobs/paused-job"'));

  const companiesPage = loadSource<{ default: () => Promise<ReactElement> }>(
    "src/app/faculty-admin/companies/review/page.tsx",
    {
      "@/actions/company-actions": {
        getCompaniesForFaculty: async () => [
          {
            id: "rejected-company",
            name: "Rejected partner",
            industry: "Du lịch",
            verificationStatus: "rejected",
            rejectedReason: "Chưa đủ thông tin liên hệ",
          },
        ],
      },
      "./company-review-actions": { CompanyReviewActions: () => null },
    },
  );
  const companiesHtml = renderToStaticMarkup(await companiesPage.default());
  assert.ok(companiesHtml.includes("Rejected partner"));
  assert.ok(companiesHtml.includes("Chưa đủ thông tin liên hệ"));

  const experiencesPage = loadSource<{ default: () => Promise<ReactElement> }>(
    "src/app/faculty-admin/experiences/review/page.tsx",
    {
      "@/actions/experience-actions": {
        getExperiencePostsForFaculty: async () => [
          {
            id: "rejected-post",
            title: "Rejected contribution",
            status: "rejected",
            createdAt: expiresAt,
            author: { name: "Cựu sinh viên" },
          },
        ],
      },
      "./experience-review-actions": { ExperienceReviewActions: () => null },
    },
  );
  const experiencesHtml = renderToStaticMarkup(await experiencesPage.default());
  assert.ok(experiencesHtml.includes("Rejected contribution"));
  assert.ok(experiencesHtml.includes('href="/experiences/rejected-post"'));
});

test("admin user mutations protect the current account and revoke sessions when locking another user", async () => {
  const scope = createScope("admin");
  const revoked: string[] = [];
  const writes: Record<string, unknown>[] = [];
  let transactions = 0;
  const auth = loadSource<AuthActions>(
    "src/actions/auth-actions.ts",
    scope.dependencies({
      transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
        transactions++;
        return callback({
          update: () => ({
            set: (values: Record<string, unknown>) => {
              writes.push(values);
              return {
                where: () => ({
                  returning: async () => [{ userId: "target-1", ...values }],
                }),
              };
            },
          }),
          delete: () => ({
            where: async (condition: SQL) => {
              revoked.push(
                ...(new PgDialect().sqlToQuery(condition).params as string[]),
              );
            },
          }),
        });
      },
      update: () => ({
        set: (values: Record<string, unknown>) => {
          writes.push(values);
          return {
            where: () => ({
              returning: async () => [{ userId: "target-1", ...values }],
            }),
          };
        },
      }),
    }),
  );
  await assert.rejects(
    () => auth.adminToggleUserLock("actor-1", true),
    /tự khóa/,
  );
  await assert.rejects(
    () => auth.adminUpdateUserRole("actor-1", "student"),
    /tự thay đổi/,
  );
  assert.equal(transactions, 0);
  assert.equal(writes.length, 0);
  await auth.adminToggleUserLock("target-1", true);
  assert.equal(writes[0].status, "locked");
  assert.deepEqual(revoked, ["target-1"]);
  await auth.adminToggleUserLock("target-1", false);
  assert.equal(writes[1].status, "active");
  assert.equal(revoked.length, 1);
  await auth.adminUpdateUserRole("target-1", "faculty_staff");
  assert.equal(writes[2].role, "faculty_staff");
  assert.equal(scope.auditEvents[2].action, "change_user_role");
});

test("admin user list identifies missing profiles without offering ineffective role/lock actions", async () => {
  const scope = createScope("admin");
  const page = loadSource<{ default: () => Promise<ReactElement> }>(
    "src/app/faculty-admin/users/page.tsx",
    {
      ...scope.dependencies({}),
      "@/actions/auth-actions": {
        adminGetUsers: async () => [
          {
            id: "orphan-account",
            name: "Incomplete account",
            email: "incomplete@example.com",
            profile: null,
            createdAt: new Date("2026-10-13"),
          },
        ],
      },
      "./user-row-actions": {
        UserRowActions: ({ userId }: { userId: string }) =>
          createElement(
            "button",
            { type: "button", "data-user-actions": userId },
            "Thao tác",
          ),
      },
    },
  );
  const html = renderToStaticMarkup(await page.default());
  assert.ok(html.includes("Chưa có hồ sơ"));
  assert.ok(html.includes("Cần hoàn thiện hồ sơ"));
  assert.ok(html.includes("Chưa thể phân quyền"));
  assert.ok(!html.includes("data-user-actions"));
  assert.ok(!html.includes("Hoạt động"));
});

test("form report route distinguishes missing records from database failures", async () => {
  let queries = 0;
  const loadPage = (error: Error) =>
    loadSource<{
      default: (props: {
        params: Promise<{ id: string }>;
      }) => Promise<ReactElement>;
    }>("src/app/faculty-admin/forms/[id]/responses/page.tsx", {
      "next/navigation": {
        notFound: () => {
          throw new Error("NEXT_NOT_FOUND");
        },
      },
      "@/actions/form-actions": {
        getFormResponsesAndAnalytics: async () => {
          queries++;
          throw error;
        },
      },
      "./response-analytics": { ResponseAnalytics: () => null },
    });
  const missingPage = loadPage(new Error("Không tìm thấy biểu mẫu"));
  await assert.rejects(
    () => missingPage.default({ params: Promise.resolve({ id: "invalid" }) }),
    /NEXT_NOT_FOUND/,
  );
  assert.equal(queries, 0);
  await assert.rejects(
    () => missingPage.default({ params: Promise.resolve({ id: entityId }) }),
    /NEXT_NOT_FOUND/,
  );
  assert.equal(queries, 1);
  const failure = new Error("Database connection unavailable");
  const brokenPage = loadPage(failure);
  await assert.rejects(
    () => brokenPage.default({ params: Promise.resolve({ id: entityId }) }),
    (error) => error === failure,
  );
});

test("admin-only pages redirect staff and anonymous visitors before reading protected data", async () => {
  for (const pageFile of [
    "src/app/faculty-admin/users/page.tsx",
    "src/app/faculty-admin/audit-logs/page.tsx",
  ]) {
    for (const [scope, expectedRoute] of [
      [createScope("faculty_staff"), "/"],
      [createScope("student", "active", true, false), "/login"],
    ] as const) {
      let queries = 0;
      const read = async () => {
        queries++;
        return [];
      };
      const page = loadSource<{ default: () => Promise<ReactElement> }>(
        pageFile,
        {
          ...scope.dependencies({}),
          "@/actions/auth-actions": { adminGetUsers: read },
          "@/actions/audit-actions": { getAuditLogs: read },
          "./user-row-actions": { UserRowActions: () => null },
          "./audit-logs-table": { AuditLogsTable: () => null },
        },
      );
      await assert.rejects(
        () => page.default(),
        (error) =>
          error instanceof Error &&
          error.message === `REDIRECT:${expectedRoute}`,
      );
      assert.equal(queries, 0);
    }
    const adminScope = createScope("admin");
    let adminQueries = 0;
    const read = async () => {
      adminQueries++;
      return [];
    };
    const page = loadSource<{ default: () => Promise<ReactElement> }>(
      pageFile,
      {
        ...adminScope.dependencies({}),
        "@/actions/auth-actions": { adminGetUsers: read },
        "@/actions/audit-actions": { getAuditLogs: read },
        "./user-row-actions": { UserRowActions: () => null },
        "./audit-logs-table": {
          AuditLogsTable: () => createElement("p", null, "Admin audit history"),
        },
      },
    );
    const html = renderToStaticMarkup(await page.default());
    assert.equal(adminQueries, 1);
    assert.ok(
      html.includes(
        pageFile.includes("audit-logs")
          ? "Admin audit history"
          : "Quản trị Người dùng",
      ),
    );
  }
});
