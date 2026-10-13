import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import ts from "typescript";
import * as schema from "../src/db/schema";
import type { UserRole } from "../src/lib/permissions";
import { companyCreateSchema } from "../src/validators/company-schema";
import { jobPostSchema } from "../src/validators/job-schema";

type CompanyActions = typeof import("../src/actions/company-actions");
type JobActions = typeof import("../src/actions/job-actions");
type Permissions = typeof import("../src/lib/permissions");
const requireModule = createRequire(path.join(process.cwd(), "package.json"));
const companyId = "11111111-1111-4111-8111-111111111111";
const otherCompanyId = "22222222-2222-4222-8222-222222222222";
const jobId = "33333333-3333-4333-8333-333333333333";
const companyInput = {
  name: " Hợp tác xã Nông nghiệp Lâm Đồng ",
  description: " Phát triển nông nghiệp bền vững tại Đà Lạt. ",
  industry: " Nông nghiệp ",
  roleInCompany: " Đại diện tuyển dụng ",
  website: " https://example.edu.vn ",
};
const jobInput = {
  companyId,
  title: " Chuyên viên phát triển vùng nguyên liệu ",
  description: " Hỗ trợ sản xuất và kết nối với các hợp tác xã. ",
  requirements: " Có kiến thức nông học và kỹ năng làm việc nhóm. ",
  location: " Đà Lạt ",
  jobType: "full_time" as const,
  applyUrlOrEmail: " tuyendung@example.edu.vn ",
  expiresAt: new Date(Date.now() + 86_400_000),
};

// Execute production code with memory dependencies. These tests never connect
// to a database, authenticate real users, deliver email, or run migrations.
const loadModule = <T>(
  filename: string,
  dependencies: Record<string, unknown>,
): T => {
  const output = ts.transpileModule(
    readFileSync(path.resolve(filename), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    },
  ).outputText;
  const actionModule = { exports: {} };
  const execute = runInNewContext(
    `(function(module, exports, require) { ${output}\n })`,
    { console, Date, URL },
  ) as (
    module: typeof actionModule,
    exports: object,
    require: (id: string) => unknown,
  ) => void;
  execute(actionModule, actionModule.exports, (id) => {
    if (id in dependencies) return dependencies[id];
    return requireModule(
      id.startsWith("@/") ? path.resolve("src", `${id.slice(2)}.ts`) : id,
    );
  });
  return actionModule.exports as T;
};

const permissionFixture = (
  role: UserRole,
  memberships: { companyId: string; isActiveContext: boolean }[] = [],
  status = "active",
) =>
  loadModule<Permissions>("src/lib/permissions.ts", {
    "next/headers": { headers: async () => new Headers() },
    "next/navigation": { redirect: () => assert.fail("Unexpected redirect") },
    "@/lib/auth": {
      auth: {
        api: {
          getSession: async () => ({ user: { id: "employer-1" }, session: {} }),
        },
      },
    },
    "@/db": {
      db: {
        select: () => ({
          from: (table: unknown) => ({
            where: async () =>
              table === schema.profiles ? [{ role, status }] : memberships,
          }),
        }),
      },
    },
  });

const loadActions = <T>(
  file: string,
  db: unknown,
  overrides: Record<string, unknown> = {},
) =>
  loadModule<T>(file, {
    "next/cache": { revalidatePath: () => undefined },
    "@/db": { db },
    "@/lib/permissions": permissionFixture("employer", [
      { companyId, isActiveContext: true },
    ]),
    "@/lib/audit": { logAuditEvent: async () => null },
    "@/lib/notifications": { sendNotification: async () => null },
    ...overrides,
  });

test("company and job validation reject whitespace-only fields and store trimmed content", () => {
  const company = companyCreateSchema.parse(companyInput);
  assert.equal(company.name, companyInput.name.trim());
  assert.equal(company.industry, "Nông nghiệp");
  assert.equal(company.roleInCompany, "Đại diện tuyển dụng");
  assert.equal(company.website, "https://example.edu.vn");
  for (const field of ["name", "description", "industry", "roleInCompany"]) {
    assert.equal(
      companyCreateSchema.safeParse({
        ...companyInput,
        [field]: "             ",
      }).success,
      false,
    );
  }
  const job = jobPostSchema.parse(jobInput);
  assert.equal(job.title, jobInput.title.trim());
  assert.equal(job.location, "Đà Lạt");
  assert.equal(job.applyUrlOrEmail, "tuyendung@example.edu.vn");
  for (const field of ["title", "description", "requirements", "location"]) {
    assert.equal(
      jobPostSchema.safeParse({ ...jobInput, [field]: "             " })
        .success,
      false,
    );
  }
});

test("company membership guards isolate employers and deny other roles or locked accounts", async () => {
  const memberships = [
    { companyId, isActiveContext: false },
    { companyId: otherCompanyId, isActiveContext: true },
  ];
  const employer = permissionFixture("employer", memberships);
  assert.equal(
    (await employer.requireCompanyContext()).companyId,
    otherCompanyId,
  );
  assert.equal(
    (await employer.requireCompanyContext(companyId)).companyId,
    companyId,
  );
  await assert.rejects(
    employer.requireCompanyContext(jobId),
    /không có quyền thao tác trên công ty/,
  );
  await assert.rejects(
    permissionFixture("employer").requireCompanyContext(),
    /chưa thuộc công ty nào/,
  );
  for (const role of ["student", "alumni", "faculty_staff"] as const) {
    await assert.rejects(
      permissionFixture(role, memberships).requireCompanyContext(companyId),
    );
  }
  await assert.rejects(
    permissionFixture("employer", memberships, "locked").requireCompanyContext(
      companyId,
    ),
    /đã bị khóa/,
  );
  assert.equal(
    (await permissionFixture("admin").requireCompanyContext(companyId))
      .companyId,
    companyId,
  );
});

test("company registration commits the pending company and active membership before refreshing its layout", async () => {
  const operations: string[] = [];
  let membership: Record<string, unknown> | undefined;
  const db = {
    transaction: async (operation: (tx: unknown) => Promise<unknown>) => {
      const result = await operation({
        select: () => ({
          from: () => ({
            where: () => ({
              for: async (lock: string) => operations.push(`lock:${lock}`),
            }),
          }),
        }),
        insert: (table: unknown) => ({
          values: (values: Record<string, unknown>) => {
            if (table === schema.companies) {
              operations.push("company");
              assert.equal(values.verificationStatus, "pending");
              assert.equal(values.createdBy, "employer-1");
              assert.equal(values.name, companyInput.name.trim());
              return { returning: async () => [{ ...values, id: companyId }] };
            }
            operations.push("membership");
            membership = values;
            return Promise.resolve();
          },
        }),
        update: () => ({
          set: (values: { isActiveContext: boolean }) => ({
            where: async (condition: SQL) => {
              operations.push("deactivate");
              assert.equal(values.isActiveContext, false);
              assert.ok(
                new PgDialect()
                  .sqlToQuery(condition)
                  .params.includes("employer-1"),
              );
            },
          }),
        }),
      });
      operations.push("commit");
      return result;
    },
  };
  const actions = loadActions<CompanyActions>(
    "src/actions/company-actions.ts",
    db,
    {
      "next/cache": {
        revalidatePath: (route: string, type?: string) =>
          operations.push(`${route}:${type || "page"}`),
      },
    },
  );
  const company = await actions.registerCompany(companyInput);
  assert.equal(company.id, companyId);
  assert.equal(membership?.companyId, companyId);
  assert.equal(membership?.userId, "employer-1");
  assert.equal(membership?.isActiveContext, true);
  assert.deepEqual(operations.slice(0, 5), [
    "lock:update",
    "company",
    "deactivate",
    "membership",
    "commit",
  ]);
  assert.ok(operations.includes("/employer:layout"));
  assert.ok(
    operations.indexOf("commit") < operations.indexOf("/employer:layout"),
  );
});

test("a failed membership insert does not signal successful registration or invalidate its layout", async () => {
  let refreshed = false;
  let audited = false;
  const actions = loadActions<CompanyActions>(
    "src/actions/company-actions.ts",
    {
      transaction: async (operation: (tx: unknown) => Promise<unknown>) =>
        operation({
          select: () => ({
            from: () => ({ where: () => ({ for: async () => undefined }) }),
          }),
          insert: (table: unknown) => ({
            values: () => {
              if (table === schema.companies) {
                return {
                  returning: async () => [{ id: companyId, name: "Đối tác" }],
                };
              }
              throw new Error("Membership write failed");
            },
          }),
          update: () => ({ set: () => ({ where: async () => undefined }) }),
        }),
    },
    {
      "next/cache": {
        revalidatePath: () => {
          refreshed = true;
        },
      },
      "@/lib/audit": {
        logAuditEvent: async () => {
          audited = true;
        },
      },
    },
  );
  await assert.rejects(
    actions.registerCompany(companyInput),
    /Membership write failed/,
  );
  assert.equal(refreshed, false);
  assert.equal(audited, false);
});

test("switching to an unowned company cannot deactivate existing memberships", async () => {
  let updates = 0;
  const actions = loadActions<CompanyActions>(
    "src/actions/company-actions.ts",
    {
      transaction: async (operation: (tx: unknown) => Promise<unknown>) =>
        operation({
          select: () => ({
            from: () => ({ where: () => ({ for: async () => undefined }) }),
          }),
          query: { companyMembers: { findFirst: async () => undefined } },
          update: () => {
            updates += 1;
            throw new Error("Unexpected update");
          },
        }),
    },
  );
  await assert.rejects(
    actions.switchActiveCompany(otherCompanyId),
    /không thuộc doanh nghiệp/,
  );
  assert.equal(updates, 0);
});

test("company switching updates only the caller and refreshes the company-dependent layout", async () => {
  const updates: { values: unknown; params: unknown[] }[] = [];
  const paths: string[] = [];
  const actions = loadActions<CompanyActions>(
    "src/actions/company-actions.ts",
    {
      transaction: async (operation: (tx: unknown) => Promise<unknown>) =>
        operation({
          select: () => ({
            from: () => ({ where: () => ({ for: async () => undefined }) }),
          }),
          query: {
            companyMembers: {
              findFirst: async (options: {
                where: { userId: string; companyId: string };
              }) => {
                assert.equal(options.where.userId, "employer-1");
                assert.equal(options.where.companyId, otherCompanyId);
                return { companyId: otherCompanyId };
              },
            },
          },
          update: () => ({
            set: (values: unknown) => ({
              where: async (condition: SQL) => {
                updates.push({
                  values,
                  params: new PgDialect().sqlToQuery(condition).params,
                });
              },
            }),
          }),
        }),
    },
    { "next/cache": { revalidatePath: (route: string) => paths.push(route) } },
  );
  await actions.switchActiveCompany(otherCompanyId);
  assert.equal(updates.length, 2);
  assert.equal(
    (updates[0].values as { isActiveContext: boolean }).isActiveContext,
    false,
  );
  assert.equal(
    (updates[1].values as { isActiveContext: boolean }).isActiveContext,
    true,
  );
  assert.deepEqual(updates[0].params, ["employer-1"]);
  assert.deepEqual(updates[1].params, ["employer-1", otherCompanyId]);
  assert.ok(paths.includes("/employer"));
});

test("invalid company and job IDs fail before querying or mutating PostgreSQL", async () => {
  const companies = loadActions<CompanyActions>(
    "src/actions/company-actions.ts",
    {},
  );
  const jobs = loadActions<JobActions>(
    "src/actions/job-actions.ts",
    {},
    {
      "@/lib/permissions": permissionFixture("admin"),
    },
  );
  await assert.rejects(
    companies.switchActiveCompany("invalid"),
    /ID doanh nghiệp/,
  );
  await assert.rejects(
    companies.reviewCompany({ companyId: "invalid", status: "verified" }),
    /Yêu cầu quyền/,
  );
  const staff = loadActions<CompanyActions>(
    "src/actions/company-actions.ts",
    {},
    {
      "@/lib/permissions": permissionFixture("faculty_staff"),
    },
  );
  await assert.rejects(
    staff.reviewCompany({ companyId: "invalid", status: "verified" }),
    /ID doanh nghiệp/,
  );
  await assert.rejects(jobs.getEmployerJobs("invalid"), /ID doanh nghiệp/);
  await assert.rejects(
    jobs.reviewJobPost({ jobId: "invalid", status: "approved" }),
    /ID tin tuyển dụng/,
  );
});

test("unverified companies and non-members cannot create jobs", async () => {
  for (const verificationStatus of ["pending", "rejected"]) {
    const jobs = loadActions<JobActions>("src/actions/job-actions.ts", {
      query: { companies: { findFirst: async () => ({ verificationStatus }) } },
    });
    await assert.rejects(jobs.createJobPost(jobInput), /chưa được xác minh/);
  }
  const outsider = loadActions<JobActions>(
    "src/actions/job-actions.ts",
    {},
    {
      "@/lib/permissions": permissionFixture("employer", [
        { companyId: otherCompanyId, isActiveContext: true },
      ]),
    },
  );
  await assert.rejects(
    outsider.createJobPost(jobInput),
    /không có quyền thao tác trên công ty/,
  );
});

test("verified members create pending jobs and refresh both employer and review lists", async () => {
  const paths: string[] = [];
  let inserted: Record<string, unknown> | undefined;
  const jobs = loadActions<JobActions>(
    "src/actions/job-actions.ts",
    {
      query: {
        companies: {
          findFirst: async () => ({ verificationStatus: "verified" }),
        },
      },
      insert: () => ({
        values: (values: Record<string, unknown>) => {
          inserted = values;
          return { returning: async () => [{ ...values, id: jobId }] };
        },
      }),
    },
    { "next/cache": { revalidatePath: (route: string) => paths.push(route) } },
  );
  await jobs.createJobPost(jobInput);
  assert.equal(inserted?.companyId, companyId);
  assert.equal(inserted?.status, "pending");
  assert.equal(inserted?.title, jobInput.title.trim());
  assert.ok(paths.includes("/employer/jobs"));
  assert.ok(paths.includes("/faculty-admin/jobs/review"));
});

test("employer job management filters the requested owned company and prevents cross-company reads", async () => {
  let queried = false;
  const jobs = loadActions<JobActions>("src/actions/job-actions.ts", {
    query: {
      jobPosts: {
        findMany: async (query: { where: { companyId: string } }) => {
          queried = true;
          assert.equal(query.where.companyId, companyId);
          return [
            {
              id: jobId,
              status: "approved",
              expiresAt: new Date(Date.now() - 1000),
            },
          ];
        },
      },
    },
  });
  const posts = await jobs.getEmployerJobs(companyId);
  assert.equal(queried, true);
  assert.equal(posts[0].status, "expired");
  queried = false;
  await assert.rejects(
    jobs.getEmployerJobs(otherCompanyId),
    /không có quyền thao tác trên công ty/,
  );
  assert.equal(queried, false);
});

test("public job lists and details select only public fields while excluding hidden or unverified jobs", async () => {
  const queries: {
    columns: Record<string, boolean>;
    where: Record<string, unknown>;
  }[] = [];
  const jobs = loadActions<JobActions>("src/actions/job-actions.ts", {
    query: {
      jobPosts: {
        findMany: async (query: (typeof queries)[number]) => {
          queries.push(query);
          return [];
        },
        findFirst: async (query: (typeof queries)[number]) => {
          queries.push(query);
          return undefined;
        },
      },
    },
  });
  await jobs.getActiveJobPosts();
  await jobs.getJobPostById(jobId);
  assert.equal(queries.length, 2);
  for (const query of queries) {
    assert.equal(query.columns.title, true);
    assert.equal(query.columns.applyUrlOrEmail, true);
    assert.equal("reviewedBy" in query.columns, false);
    assert.equal("reviewedAt" in query.columns, false);
    assert.equal("rejectedReason" in query.columns, false);
    assert.equal(
      (query.where.company as { verificationStatus: string })
        .verificationStatus,
      "verified",
    );
  }
  assert.equal(queries[0].where.status, "approved");
  assert.ok(
    (queries[0].where.expiresAt as { gt: Date }).gt >
      new Date(Date.now() - 1000),
  );
  assert.deepEqual(
    Array.from((queries[1].where.status as { in: string[] }).in),
    ["approved", "expired"],
  );
});

test("job review remains staff-only and refreshes published surfaces after notifying company members", async () => {
  for (const role of ["student", "alumni", "employer"] as const) {
    const jobs = loadActions<JobActions>(
      "src/actions/job-actions.ts",
      {},
      {
        "@/lib/permissions": permissionFixture(role),
      },
    );
    await assert.rejects(
      jobs.reviewJobPost({ jobId, status: "approved" }),
      /Yêu cầu quyền/,
    );
  }
  const notifications: { userId: string; linkUrl: string }[] = [];
  const paths: string[] = [];
  const jobs = loadActions<JobActions>(
    "src/actions/job-actions.ts",
    {
      update: () => ({
        set: (values: Record<string, unknown>) => ({
          where: () => ({
            returning: async () => [
              {
                ...values,
                id: jobId,
                companyId,
                title: "Chuyên viên nông học",
              },
            ],
          }),
        }),
      }),
      query: {
        companyMembers: {
          findMany: async () => [
            { userId: "employer-1" },
            { userId: "employer-2" },
          ],
        },
      },
    },
    {
      "@/lib/permissions": permissionFixture("faculty_staff"),
      "@/lib/notifications": {
        sendNotification: async (payload: (typeof notifications)[number]) =>
          notifications.push(payload),
      },
      "next/cache": { revalidatePath: (route: string) => paths.push(route) },
    },
  );
  await jobs.reviewJobPost({ jobId, status: "approved" });
  assert.deepEqual(
    notifications.map((item) => item.userId),
    ["employer-1", "employer-2"],
  );
  assert.ok(notifications.every((item) => item.linkUrl === "/employer/jobs"));
  for (const route of [
    "/employer/jobs",
    "/faculty-admin/jobs/review",
    "/jobs",
    "/jobs/[id]",
    "/",
  ]) {
    assert.ok(paths.includes(route));
  }
});

test("company context mutations invalidate cached jobs and refresh the employer layout", () => {
  const invalidated: string[][] = [];
  let refreshes = 0;
  const hooks = loadModule<{
    useSwitchCompany: () => { onSuccess: () => void };
    useRegisterCompany: () => { onSuccess: () => void };
    useReviewCompany: () => {
      onSuccess: (result: unknown, input: { status: string }) => void;
    };
  }>("src/hooks/use-companies.ts", {
    "@tanstack/react-query": {
      useMutation: (options: unknown) => options,
      useQueryClient: () => ({
        invalidateQueries: ({ queryKey }: { queryKey: string[] }) =>
          invalidated.push(Array.from(queryKey)),
      }),
    },
    "next/navigation": {
      useRouter: () => ({
        refresh: () => {
          refreshes += 1;
        },
      }),
    },
    "@/actions/company-actions": {},
    "@/hooks/use-jobs": { jobKeys: { all: ["jobs"] } },
    "@/components/ui/toast": { toast: { add: () => undefined } },
  });
  hooks.useSwitchCompany().onSuccess();
  assert.ok(invalidated.some((key) => key.join("/") === "companies/my"));
  assert.ok(invalidated.some((key) => key.join("/") === "jobs"));
  assert.equal(refreshes, 1);
  invalidated.length = 0;
  hooks.useRegisterCompany().onSuccess();
  assert.ok(invalidated.some((key) => key.join("/") === "jobs"));
  invalidated.length = 0;
  hooks.useReviewCompany().onSuccess(undefined, { status: "rejected" });
  assert.ok(invalidated.some((key) => key.join("/") === "jobs"));
});

test("job search escapes literal wildcard characters in keywords, locations and industries", async () => {
  const jobs = loadActions<JobActions>("src/actions/job-actions.ts", {
    query: {
      jobPosts: {
        findMany: async (query: {
          where: {
            OR: { title?: { ilike: string } }[];
            location: { ilike: string };
            company: { industry: { ilike: string } };
          };
        }) => {
          assert.equal(query.where.OR[0].title?.ilike, "%100\\%\\_%");
          assert.equal(query.where.location.ilike, "%\\_%");
          assert.equal(query.where.company.industry.ilike, "%\\%%");
          return [];
        },
      },
    },
  });
  await jobs.getActiveJobPosts({
    search: " 100%_ ",
    location: "_",
    industry: "%",
  });
});
