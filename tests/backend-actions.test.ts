import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import ts from "typescript";
import { getPagination } from "../src/lib/query-input";
import { jobPostSchema } from "../src/validators/job-schema";
import {
  campaignCreateSchema,
  donationPledgeSchema,
} from "../src/validators/scholarship-schema";

type EventActions = typeof import("../src/actions/event-actions");
type JobActions = typeof import("../src/actions/job-actions");
type ScholarshipActions = typeof import("../src/actions/scholarship-actions");
type NewsActions = typeof import("../src/actions/news-actions");
type ExperienceActions = typeof import("../src/actions/experience-actions");
const requireModule = createRequire(path.join(process.cwd(), "package.json"));
const campaignId = "11111111-1111-4111-8111-111111111111";
const formId = "22222222-2222-4222-8222-222222222222";
const responseId = "33333333-3333-4333-8333-333333333333";

// Load the production actions with isolated dependencies so these checks never
// connect to PostgreSQL, Redis, authentication providers, or email services.
function loadActions<T>(file: string, db: unknown, userId = "student-1"): T {
  const current = { user: { id: userId }, role: "student" };
  const dependencies: Record<string, unknown> = {
    "next/cache": { revalidatePath: () => undefined },
    "@/db": { db },
    "@/lib/permissions": {
      getCurrentUser: async () => current,
      requireRole: async () => current,
      requireActiveUser: async () => current,
      requireCompanyContext: async () => ({ ...current, companyId: null }),
    },
    "@/lib/audit": { logAuditEvent: async () => null },
    "@/lib/notifications": { sendNotification: async () => null },
  };
  const output = ts.transpileModule(readFileSync(path.resolve(file), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
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
}

test("campaign deadlines and amounts reject values PostgreSQL cannot store", () => {
  const campaign = {
    title: "Quỹ học bổng",
    description: "Hỗ trợ sinh viên có hoàn cảnh khó khăn",
    targetAmount: 1_000_000,
    applicationDeadline: "invalid-date",
    status: "open",
  };
  assert.equal(campaignCreateSchema.safeParse(campaign).success, false);
  const pledge = { campaignId, donorDisplayName: "Nhà tài trợ", amount: 0.001 };
  assert.equal(donationPledgeSchema.safeParse(pledge).success, false);
  assert.equal(
    donationPledgeSchema.safeParse({ ...pledge, amount: 1e14 }).success,
    false,
  );
  assert.equal(
    donationPledgeSchema.safeParse({ ...pledge, amount: 1234.56 }).success,
    true,
  );
});

test("malformed detail URLs return a missing record without querying UUID columns", async () => {
  const db = {};
  const events = loadActions<EventActions>("src/actions/event-actions.ts", db);
  const scholarships = loadActions<ScholarshipActions>(
    "src/actions/scholarship-actions.ts",
    db,
  );
  const jobs = loadActions<JobActions>("src/actions/job-actions.ts", db);
  const news = loadActions<NewsActions>("src/actions/news-actions.ts", db);
  const experiences = loadActions<ExperienceActions>(
    "src/actions/experience-actions.ts",
    db,
  );
  assert.equal(await events.getEventById("not-a-uuid"), null);
  assert.equal(await scholarships.getCampaignById("not-a-uuid"), null);
  assert.equal(await jobs.getJobPostById("not-a-uuid"), undefined);
  assert.equal(await news.getNewsById("not-a-uuid"), null);
  assert.equal(await experiences.getExperiencePostById("not-a-uuid"), null);
});

test("database pagination remains finite and integral for arbitrary action inputs", () => {
  assert.deepEqual(getPagination({ limit: Infinity, offset: NaN }), {
    limit: 20,
    offset: 0,
  });
  assert.deepEqual(getPagination({ limit: 10.9, offset: 3.7 }), {
    limit: 10,
    offset: 3,
  });
  assert.deepEqual(getPagination({ limit: -1, offset: -8 }), {
    limit: 1,
    offset: 0,
  });
  assert.deepEqual(getPagination({ limit: 999, offset: 0 }, 12), {
    limit: 50,
    offset: 0,
  });
});

test("invalid job-type query parameters do not reach PostgreSQL enums", async () => {
  const db = {
    query: {
      jobPosts: {
        findMany: async (query: { where: { jobType?: string } }) => {
          assert.equal(query.where.jobType, undefined);
          return [];
        },
      },
    },
  };
  const actions = loadActions<JobActions>("src/actions/job-actions.ts", db);
  await actions.getActiveJobPosts({ jobType: "invalid" as "full_time" });
});

test("managed jobs report expired approval without requiring a Redis worker", async () => {
  const expired = {
    id: campaignId,
    status: "approved",
    expiresAt: new Date(Date.now() - 1000),
  };
  const active = {
    id: formId,
    status: "approved",
    expiresAt: new Date(Date.now() + 86_400_000),
  };
  const db = {
    query: { jobPosts: { findMany: async () => [expired, active] } },
  };
  const actions = loadActions<JobActions>("src/actions/job-actions.ts", db);
  const posts = await actions.getJobsForFacultyReview();
  assert.equal(posts[0].status, "expired");
  assert.equal(posts[1].status, "approved");
});

test("job approval atomically requires a future deadline and verified company", async () => {
  const db = {
    update: () => ({
      set: () => ({
        where: (condition: SQL) => {
          const query = new PgDialect().sqlToQuery(condition);
          assert.match(query.sql, /expires_at.*>/);
          assert.match(query.sql, /verification_status/);
          assert.ok(query.params.includes("verified"));
          return { returning: async () => [] };
        },
      }),
    }),
  };
  const actions = loadActions<JobActions>("src/actions/job-actions.ts", db);
  await assert.rejects(
    actions.reviewJobPost({ jobId: campaignId, status: "approved" }),
    /đã hết hạn/,
  );
});

test("open scholarship campaigns cannot link forms unavailable to student applicants", async () => {
  const input = {
    title: "Quỹ học bổng",
    description: "Hỗ trợ sinh viên có hoàn cảnh khó khăn",
    targetAmount: 1_000_000,
    applicationDeadline: new Date(Date.now() + 86_400_000),
    applicationFormId: formId,
    status: "open" as const,
  };
  for (const form of [
    { targetRole: "alumni", status: "open", deadline: null },
    { targetRole: "student", status: "closed", deadline: null },
    {
      targetRole: "all",
      status: "open",
      deadline: new Date(Date.now() - 1000),
    },
  ]) {
    const db = { query: { forms: { findFirst: async () => form } } };
    const actions = loadActions<ScholarshipActions>(
      "src/actions/scholarship-actions.ts",
      db,
    );
    await assert.rejects(
      actions.createScholarshipCampaign(input),
      /Biểu mẫu học bổng/,
    );
  }
});

test("job application addresses accept HTTP URLs and email, and reject unsafe schemes", () => {
  const job = {
    companyId: campaignId,
    title: "Developer",
    description: "Build alumni community features",
    requirements: "Experience with TypeScript",
    location: "Hồ Chí Minh",
    jobType: "full_time",
    expiresAt: new Date(Date.now() + 86_400_000),
  };
  for (const address of [
    "javascript:alert(1)",
    "data:text/html,test",
    "https://",
    "http://exa mple.com",
  ]) {
    assert.equal(
      jobPostSchema.safeParse({ ...job, applyUrlOrEmail: address }).success,
      false,
    );
  }
  for (const address of [
    "hr@example.com",
    "https://example.com/jobs?ref=hr@example.com",
  ]) {
    assert.equal(
      jobPostSchema.safeParse({ ...job, applyUrlOrEmail: address }).success,
      true,
    );
  }
});

test("scholarship applications cannot bypass the campaign form", async () => {
  let inserted = false;
  const db = {
    query: {
      scholarshipCampaigns: {
        findFirst: async () => ({
          status: "open",
          applicationDeadline: new Date(Date.now() + 86_400_000),
          applicationFormId: formId,
        }),
      },
      scholarshipApplications: { findFirst: async () => undefined },
      formResponses: { findFirst: async () => undefined },
    },
    insert: () => {
      inserted = true;
      throw new Error("Unexpected insert");
    },
  };
  const actions = loadActions<ScholarshipActions>(
    "src/actions/scholarship-actions.ts",
    db,
  );
  await assert.rejects(
    actions.applyForScholarship(campaignId),
    /hoàn thành biểu mẫu/,
  );
  assert.equal(inserted, false);
});

test("scholarship applications attach only the caller's response to the linked form", async () => {
  let inserted: { formResponseId?: string } | undefined;
  const db = {
    query: {
      scholarshipCampaigns: {
        findFirst: async () => ({
          status: "open",
          applicationDeadline: new Date(Date.now() + 86_400_000),
          applicationFormId: formId,
        }),
      },
      scholarshipApplications: { findFirst: async () => undefined },
      formResponses: {
        findFirst: async ({
          where,
        }: {
          where: { respondentId?: string; formId?: string; id?: string };
        }) => {
          // A response from another student/form must not be selected.
          if (where.respondentId !== "student-1" || where.formId !== formId)
            return undefined;
          return where.id && where.id !== responseId
            ? undefined
            : { id: responseId, formId };
        },
      },
    },
    insert: () => ({
      values: (value: typeof inserted) => {
        inserted = value;
        return {
          onConflictDoNothing: () => ({
            returning: async () => [{ id: "application-1", ...value }],
          }),
        };
      },
    }),
  };
  const actions = loadActions<ScholarshipActions>(
    "src/actions/scholarship-actions.ts",
    db,
  );
  await actions.applyForScholarship(campaignId);
  assert.equal(inserted?.formResponseId, responseId);
  await assert.rejects(
    actions.applyForScholarship(campaignId, formId),
    /hoàn thành biểu mẫu/,
  );
});

test("public job details exclude unpublished posts and private reviewer data", async () => {
  let queried = false;
  const db = {
    query: {
      jobPosts: {
        findFirst: async (query: {
          where: {
            status?: { in?: string[] };
            company?: { verificationStatus?: string };
          };
          with?: Record<string, unknown>;
        }) => {
          queried = true;
          assert.equal(query.where.status?.in?.includes("pending"), false);
          assert.equal(query.where.status?.in?.includes("rejected"), false);
          assert.equal(query.where.company?.verificationStatus, "verified");
          assert.equal(query.with?.reviewer, undefined);
          return undefined;
        },
      },
    },
  };
  const actions = loadActions<JobActions>("src/actions/job-actions.ts", db);
  assert.equal(await actions.getJobPostById(campaignId), undefined);
  assert.equal(queried, true);
});

test("job industry filtering happens before pagination and page sizes stay valid", async () => {
  const db = {
    query: {
      jobPosts: {
        findMany: async (query: {
          where: { company?: { industry?: { ilike?: string } } };
          limit: number;
          offset: number;
        }) => {
          assert.equal(query.where.company?.industry?.ilike, "%Technology%");
          assert.equal(query.limit, 50);
          assert.equal(query.offset, 0);
          return [];
        },
      },
    },
  };
  const actions = loadActions<JobActions>("src/actions/job-actions.ts", db);
  await actions.getActiveJobPosts({
    industry: " Technology ",
    limit: 1000,
    offset: -10,
  });
});

test("speaker responses validate runtime status and report stale or missing invites", async () => {
  let updates = 0;
  const db = {
    update: () => {
      updates++;
      return {
        set: () => ({
          where: (condition: SQL) => {
            const query = new PgDialect().sqlToQuery(condition);
            assert.ok(query.params.includes("pending"));
            assert.ok(query.params.includes("student-1"));
            return { returning: async () => [] };
          },
        }),
      };
    },
  };
  const actions = loadActions<EventActions>("src/actions/event-actions.ts", db);
  await assert.rejects(
    actions.respondSpeakerInvitation(responseId, "pending" as "accepted"),
  );
  assert.equal(updates, 0);
  await assert.rejects(
    actions.respondSpeakerInvitation(responseId, "accepted"),
    /đã được phản hồi/,
  );
});

test("simultaneous event registrations cannot take the same final seat", async () => {
  type Registration = { id: string; userId: string; eventId: string };
  const registrations: Registration[] = [];
  const event = {
    id: campaignId,
    status: "published",
    capacity: 1,
    endTime: new Date(Date.now() + 86_400_000),
  };
  let lockTail = Promise.resolve();
  let lockCount = 0;
  const insert = () => ({
    values: (input: Omit<Registration, "id">) => ({
      onConflictDoNothing: () => ({
        returning: async () => {
          await new Promise<void>((resolve) => setImmediate(resolve));
          const registration = {
            id: `registration-${registrations.length}`,
            ...input,
          };
          registrations.push(registration);
          return [registration];
        },
      }),
    }),
  });
  const db = {
    // Also support the former unprotected path to expose oversubscription.
    query: {
      events: {
        findFirst: async () => ({
          ...event,
          registrations: [...registrations],
        }),
      },
    },
    insert,
    transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
      let release: (() => void) | undefined;
      const tx = {
        select: (selection?: object) => ({
          from: () => ({
            where: () =>
              selection
                ? Promise.resolve([{ total: registrations.length }])
                : {
                    for: async () => {
                      const previous = lockTail;
                      lockTail = new Promise<void>((resolve) => {
                        release = resolve;
                      });
                      await previous;
                      lockCount++;
                      return [event];
                    },
                  },
          }),
        }),
        query: {
          eventRegistrations: {
            findFirst: async ({ where }: { where: { userId: string } }) =>
              registrations.find(
                (registration) => registration.userId === where.userId,
              ),
          },
        },
        insert,
      };
      try {
        return await callback(tx);
      } finally {
        release?.();
      }
    },
  };
  const first = loadActions<EventActions>(
    "src/actions/event-actions.ts",
    db,
    "student-1",
  );
  const second = loadActions<EventActions>(
    "src/actions/event-actions.ts",
    db,
    "student-2",
  );
  const results = await Promise.allSettled([
    first.registerForEvent(campaignId),
    second.registerForEvent(campaignId),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(registrations.length, 1);
  assert.equal(lockCount, 2);
  // Retrying an existing registration still succeeds after the event is full.
  const retry = await first.registerForEvent(campaignId);
  assert.equal("id" in retry ? retry.id : undefined, registrations[0].id);
  assert.equal(registrations.length, 1);
});
