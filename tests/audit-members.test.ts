import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FundCard } from "../src/components/landing/landing-parts";
import { Footer } from "../src/components/shared/footer";
import type { UserRole } from "../src/lib/permissions";

type EventActions = typeof import("../src/actions/event-actions");
type ExperienceActions = typeof import("../src/actions/experience-actions");
type ScholarshipActions = typeof import("../src/actions/scholarship-actions");
type Member = {
  user: { id: string };
  role: UserRole;
  profile: { status: "active" | "locked" } | null;
};
const eventId = "11111111-1111-4111-8111-111111111111";
const invitationId = "22222222-2222-4222-8222-222222222222";
const formId = "33333333-3333-4333-8333-333333333333";
const responseId = "44444444-4444-4444-8444-444444444444";
const requireModule = createRequire(path.join(process.cwd(), "package.json"));
const roles: UserRole[] = [
  "student",
  "alumni",
  "employer",
  "faculty_staff",
  "admin",
];

const member = (
  role: UserRole = "alumni",
  status: "active" | "locked" = "active",
): Member => ({ user: { id: "member-1" }, role, profile: { status } });

// Execute production actions with isolated dependencies. All database writes,
// audit events, notifications and role sessions in this file are in-memory.
const loadActions = <T>(
  file: string,
  db: unknown,
  current: Member | null = member(),
) => {
  const dependencies: Record<string, unknown> = {
    "@/db": { db },
    "@/lib/audit": { logAuditEvent: async () => undefined },
    "@/lib/notifications": { sendNotification: async () => undefined },
    "next/cache": { revalidatePath: () => undefined },
    "@/lib/permissions": {
      getCurrentUser: async () => current,
      requireActiveUser: async () => {
        if (!current || current.profile?.status !== "active")
          throw new Error("Tài khoản không hoạt động");
        return current;
      },
      requireRole: async (allowed: UserRole[]) => {
        if (
          !current ||
          current.profile?.status !== "active" ||
          (current.role !== "admin" && !allowed.includes(current.role))
        )
          throw new Error("Không có quyền");
        return current;
      },
    },
  };
  const output = tsOutput(file);
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

const tsOutput = (file: string) => {
  const ts = requireModule("typescript") as typeof import("typescript");
  return ts.transpileModule(readFileSync(path.resolve(file), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
};

const loadView = <T>(
  file: string,
  dependencies: Record<string, unknown>,
): T => {
  const viewModule = { exports: {} };
  const execute = runInNewContext(
    `(function(module, exports, require) { ${tsOutput(file)}\n })`,
    { console, Date, URL, URLSearchParams, setTimeout },
  ) as (
    module: typeof viewModule,
    exports: object,
    require: (id: string) => unknown,
  ) => void;
  execute(viewModule, viewModule.exports, (id) => {
    if (id in dependencies) return dependencies[id];
    if (id.startsWith("@/")) {
      const source = path.resolve("src", id.slice(2));
      return requireModule(
        existsSync(`${source}.tsx`) ? `${source}.tsx` : `${source}.ts`,
      );
    }
    return requireModule(id);
  });
  return viewModule.exports as T;
};

const renderView = (view: ReactNode) =>
  renderToStaticMarkup(
    createElement(
      AppRouterContext.Provider,
      {
        value: {
          back: () => undefined,
          forward: () => undefined,
          refresh: () => undefined,
          push: () => undefined,
          replace: () => undefined,
          prefetch: () => undefined,
          bfcacheId: "member-audit-ssr-test",
        },
      },
      view,
    ),
  );

const campaign = {
  id: eventId,
  title: "Tiếp sức sinh viên toàn trường",
  description: "Đồng hành cùng sinh viên Đại học Đà Lạt.",
  status: "open",
  targetAmount: "100000000",
  currentAmount: "10000000",
  applicationDeadline: new Date(Date.now() + 86_400_000),
  pledges: [],
  pledgeCount: 0,
  applicationCount: 0,
};
type ScholarshipDetailView = {
  default: (props: { params: Promise<{ id: string }> }) => Promise<ReactNode>;
};
const renderScholarshipDetail = async (
  current: Member | null,
  overrides: Partial<typeof campaign> = {},
) => {
  const page = loadView<ScholarshipDetailView>(
    "src/app/(public)/scholarships/[id]/page.tsx",
    {
      "@/actions/scholarship-actions": {
        getCampaignById: async () => ({ ...campaign, ...overrides }),
      },
      "@/lib/permissions": { getCurrentUser: async () => current },
      "next/navigation": { notFound: () => assert.fail("Unexpected 404") },
    },
  );
  return renderView(
    await page.default({ params: Promise.resolve({ id: campaign.id }) }),
  );
};

test("scholarship detail SSR offers applications only to active students and admins", async () => {
  const applicationHref = `/student/scholarships/${campaign.id}/apply`;
  const pledgeHref = `/account/scholarships/pledge?campaignId=${campaign.id}`;
  for (const role of roles) {
    const html = await renderScholarshipDetail(member(role));
    assert.equal(
      html.includes(`href="${applicationHref}"`),
      role === "student" || role === "admin",
      role,
    );
    assert.ok(html.includes(`href="${pledgeHref}"`), role);
    assert.ok(!html.includes("/employer/scholarships/pledge"), role);
  }
  for (const role of ["student", "admin"] as UserRole[]) {
    const html = await renderScholarshipDetail(member(role, "locked"));
    assert.ok(!html.includes(`href="${applicationHref}"`));
    assert.ok(!html.includes(`href="${pledgeHref}"`));
  }
  const missingProfile = await renderScholarshipDetail({
    ...member("student"),
    profile: null,
  });
  assert.ok(!missingProfile.includes(`href="${applicationHref}"`));
});

test("anonymous scholarship CTA preserves the selected campaign through login", async () => {
  const html = await renderScholarshipDetail(null);
  const applicationHref = `/student/scholarships/${campaign.id}/apply`;
  const pledgeHref = `/account/scholarships/pledge?campaignId=${campaign.id}`;
  for (const callbackUrl of [applicationHref, pledgeHref]) {
    const loginHref = `/login?${new URLSearchParams({ callbackUrl })}`;
    assert.ok(html.includes(`href="${loginHref}"`), loginHref);
  }
  assert.ok(!html.includes(`href="${applicationHref}"`));
  assert.ok(html.includes("Đăng nhập để nộp hồ sơ"));
});

test("closed, draft and expired scholarship campaigns never advertise a valid application", async () => {
  const applicationHref = `/student/scholarships/${campaign.id}/apply`;
  const pledgeHref = `/account/scholarships/pledge?campaignId=${campaign.id}`;
  for (const status of ["closed", "draft"]) {
    const html = await renderScholarshipDetail(member("student"), { status });
    assert.ok(!html.includes(`href="${applicationHref}"`), status);
    assert.ok(!html.includes(`href="${pledgeHref}"`), status);
    assert.ok(!html.includes("Đang nhận hồ sơ"), status);
  }
  const expired = await renderScholarshipDetail(member("student"), {
    applicationDeadline: new Date(0),
  });
  assert.ok(!expired.includes(`href="${applicationHref}"`));
  assert.ok(expired.includes(`href="${pledgeHref}"`));
  assert.ok(expired.includes("Đã hết hạn nộp hồ sơ"));
});

type PledgeFormView = {
  PledgeForm: typeof import("../src/app/employer/scholarships/pledge/pledge-form").PledgeForm;
};
const pledgeForm = loadView<PledgeFormView>(
  "src/app/employer/scholarships/pledge/pledge-form.tsx",
  {
    "@/actions/scholarship-actions": {
      createDonationPledge: () => assert.fail("SSR must not create a pledge"),
    },
    "next/navigation": {
      useRouter: () => ({ push: () => undefined }),
    },
  },
);
type PledgePageView = {
  default: (props: {
    searchParams: Promise<{ campaignId?: string | string[] }>;
  }) => Promise<ReactNode>;
};

test("shared scholarship pledge route accepts all active roles and selects the requested open campaign", async () => {
  const campaigns = [
    campaign,
    { ...campaign, id: invitationId, title: "Học bổng thứ hai" },
  ];
  for (const role of roles) {
    const page = loadView<PledgePageView>(
      "src/app/account/scholarships/pledge/page.tsx",
      {
        "@/actions/scholarship-actions": {
          getScholarshipCampaigns: async () => campaigns,
        },
        "@/lib/permissions": {
          requireRoleOrRedirect: async (allowed: UserRole[]) => {
            assert.ok(allowed.includes(role), role);
            return {
              ...member(role),
              user: { id: "member-1", name: "Nguyễn Minh" },
            };
          },
        },
        "@/app/employer/scholarships/pledge/pledge-form": pledgeForm,
      },
    );
    const html = renderView(
      await page.default({
        searchParams: Promise.resolve({ campaignId: invitationId }),
      }),
    );
    assert.ok(
      html.includes(`<option value="${invitationId}" selected="">`),
      role,
    );
    assert.ok(html.includes('value="Nguyễn Minh"'), role);
    assert.ok(html.includes("chưa phải khoản tiền đã tiếp nhận"), role);
    assert.ok(
      html.includes("chỉ xác nhận đã nhận tiền sau khi đối soát"),
      role,
    );
    assert.ok(html.includes("<form"), role);
  }
});

test("pledge campaign selection rejects arbitrary IDs and an empty list has no submission form", async () => {
  const pageWith = (campaigns: (typeof campaign)[]) =>
    loadView<PledgePageView>("src/app/account/scholarships/pledge/page.tsx", {
      "@/actions/scholarship-actions": {
        getScholarshipCampaigns: async () => campaigns,
      },
      "@/lib/permissions": {
        requireRoleOrRedirect: async () => ({
          ...member(),
          user: { name: "Cựu sinh viên" },
        }),
      },
      "@/app/employer/scholarships/pledge/pledge-form": pledgeForm,
    });
  const html = renderView(
    await pageWith([campaign]).default({
      searchParams: Promise.resolve({ campaignId: "closed-or-unknown" }),
    }),
  );
  assert.ok(html.includes("Chiến dịch được chọn không còn mở nhận tài trợ"));
  assert.ok(html.includes(`<option value="${campaign.id}" selected="">`));
  assert.ok(!html.includes('value="closed-or-unknown"'));
  const invalidForm = renderView(
    createElement(pledgeForm.PledgeForm, {
      campaigns: [campaign],
      defaultName: "Cựu sinh viên",
      initialCampaignId: "closed-or-unknown",
    }),
  );
  assert.ok(
    invalidForm.includes(`<option value="${campaign.id}" selected="">`),
  );
  const empty = renderView(
    await pageWith([]).default({ searchParams: Promise.resolve({}) }),
  );
  assert.ok(!empty.includes("<form"));
  assert.ok(empty.includes("chưa có chiến dịch học bổng nào đang mở"));
});

test("public scholarship list, landing and footer link to the shared funding route", async () => {
  const page = loadView<{ default: () => Promise<ReactNode> }>(
    "src/app/(public)/scholarships/page.tsx",
    {
      "@/actions/scholarship-actions": {
        getScholarshipCampaigns: async () => [campaign],
      },
    },
  );
  const list = renderView(await page.default());
  const landing = renderView(
    createElement(FundCard, {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        targetAmount: Number(campaign.targetAmount),
        currentAmount: Number(campaign.currentAmount),
        applicationDeadline: campaign.applicationDeadline,
      },
    }),
  );
  const footer = renderView(createElement(Footer));
  for (const html of [list, landing, footer]) {
    assert.ok(html.includes("/account/scholarships/pledge"));
    assert.ok(!html.includes("/employer/scholarships/pledge"));
  }
  for (const html of [list, landing]) {
    assert.ok(
      html.includes(`/account/scholarships/pledge?campaignId=${campaign.id}`),
    );
  }
  assert.ok(list.includes("Xem chi tiết"));
  assert.ok(!list.includes("Nộp hồ sơ học bổng"));
});

test("private experience previews are limited to an active author or active operators", async () => {
  let views = 0;
  let authorColumns: Record<string, boolean> = {};
  const post = { id: eventId, authorId: "author-1", status: "pending" };
  const db = {
    query: {
      experiencePosts: {
        findFirst: async (options: {
          with: { author: { columns: Record<string, boolean> } };
        }) => {
          authorColumns = options.with.author.columns;
          return post;
        },
      },
    },
    update: () => {
      views++;
      return { set: () => ({ where: async () => undefined }) };
    },
  };
  for (const role of roles) {
    const actions = loadActions<ExperienceActions>(
      "src/actions/experience-actions.ts",
      db,
      member(role),
    );
    const actual = await actions.getExperiencePostById(eventId);
    assert.equal(
      actual !== null,
      role === "faculty_staff" || role === "admin",
      role,
    );
  }
  const author = { ...member(), user: { id: "author-1" } };
  const activeAuthor = loadActions<ExperienceActions>(
    "src/actions/experience-actions.ts",
    db,
    author,
  );
  assert.equal(await activeAuthor.getExperiencePostById(eventId), post);
  for (const current of [
    null,
    { ...author, profile: { status: "locked" as const } },
    member("admin", "locked"),
    { ...member("admin"), profile: null },
  ]) {
    const actions = loadActions<ExperienceActions>(
      "src/actions/experience-actions.ts",
      db,
      current,
    );
    assert.equal(await actions.getExperiencePostById(eventId), null);
  }
  assert.equal(views, 0, "previews do not increment published view counts");
  assert.deepEqual(Object.keys(authorColumns), ["id", "name"]);
});

test("public experience pages remain readable anonymously and increment views", async () => {
  let views = 0;
  const post = { id: eventId, authorId: "author-1", status: "published" };
  const actions = loadActions<ExperienceActions>(
    "src/actions/experience-actions.ts",
    {
      query: { experiencePosts: { findFirst: async () => post } },
      update: () => {
        views++;
        return { set: () => ({ where: async () => undefined }) };
      },
    },
    null,
  );
  assert.equal(await actions.getExperiencePostById(eventId), post);
  assert.equal(views, 1);
});

test("locked and incomplete operators cannot read draft events or scholarship campaigns", async () => {
  const event = { id: eventId, status: "draft", registrations: [] };
  const campaign = { id: eventId, status: "draft", pledges: [] };
  const db = {
    query: {
      events: { findFirst: async () => event },
      scholarshipCampaigns: { findFirst: async () => campaign },
    },
    select: () => ({ from: () => ({ where: async () => [{ total: 0 }] }) }),
  };
  for (const current of [
    member("admin", "locked"),
    member("faculty_staff", "locked"),
    { ...member("admin"), profile: null },
    member("student"),
    null,
  ]) {
    const events = loadActions<EventActions>(
      "src/actions/event-actions.ts",
      db,
      current,
    );
    const scholarships = loadActions<ScholarshipActions>(
      "src/actions/scholarship-actions.ts",
      db,
      current,
    );
    assert.equal(await events.getEventById(eventId), null);
    assert.equal(await scholarships.getCampaignById(eventId), null);
  }
  const events = loadActions<EventActions>(
    "src/actions/event-actions.ts",
    db,
    member("faculty_staff"),
  );
  const scholarships = loadActions<ScholarshipActions>(
    "src/actions/scholarship-actions.ts",
    db,
    member("admin"),
  );
  assert.ok(await events.getEventById(eventId));
  assert.ok(await scholarships.getCampaignById(eventId));
});

test("inactive accounts cannot query their private registrations, posts or applications", async () => {
  for (const current of [
    member("alumni", "locked"),
    { ...member("student"), profile: null },
    null,
  ]) {
    // A DB call would fail because this fixture has no query methods.
    const events = loadActions<EventActions>(
      "src/actions/event-actions.ts",
      {},
      current,
    );
    const experiences = loadActions<ExperienceActions>(
      "src/actions/experience-actions.ts",
      {},
      current,
    );
    const scholarships = loadActions<ScholarshipActions>(
      "src/actions/scholarship-actions.ts",
      {},
      current,
    );
    const eventData = await events.getMyEventsAndInvites();
    assert.equal(eventData.registrations.length, 0);
    assert.equal(eventData.speakerInvites.length, 0);
    assert.equal((await experiences.getMyExperiencePosts()).length, 0);
    assert.equal((await scholarships.getMyScholarshipApplications()).length, 0);
  }
});

test("alumni posting validates visible sanitized content and always enters review", async () => {
  let saved: Record<string, unknown> | undefined;
  const db = {
    insert: () => ({
      values: (value: Record<string, unknown>) => {
        saved = value;
        return { returning: async () => [{ id: eventId, ...value }] };
      },
    }),
  };
  const actions = loadActions<ExperienceActions>(
    "src/actions/experience-actions.ts",
    db,
  );
  for (const content of [
    "<p><strong></strong></p><p><br></p>",
    "<script>Very long script that is removed before saving</script>",
    "<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>",
  ]) {
    await assert.rejects(
      actions.createExperiencePost({ title: "Bài chia sẻ", content, tags: [] }),
      /20 ký tự/,
    );
    assert.equal(saved, undefined);
  }
  await assert.rejects(
    actions.createExperiencePost({
      title: "        ",
      content: "Nội dung hợp lệ có đủ ít nhất hai mươi ký tự.",
      tags: [],
    }),
  );
  const post = await actions.createExperiencePost({
    title: "  Bài chia sẻ  ",
    content:
      '<p onclick="alert(1)">Kinh nghiệm thực tập và học tập dành cho sinh viên.</p><script>alert(1)</script>',
    tags: ["Kinh nghiệm"],
    ...({ status: "published" } as object),
  });
  assert.equal(post.id, eventId);
  assert.equal(saved?.authorId, "member-1");
  assert.equal(saved?.title, "Bài chia sẻ");
  assert.equal(saved?.status, "pending");
  assert.ok(!String(saved?.content).includes("script"));
  assert.ok(!String(saved?.content).includes("onclick"));
});

test("students, employers and operators cannot use the alumni-only posting action", async () => {
  for (const role of ["student", "employer", "faculty_staff"] as UserRole[]) {
    const actions = loadActions<ExperienceActions>(
      "src/actions/experience-actions.ts",
      {},
      member(role),
    );
    await assert.rejects(
      actions.createExperiencePost({
        title: "Kinh nghiệm học tập",
        content: "Nội dung hợp lệ nhưng vai trò không được đăng bài.",
        tags: [],
      }),
      /Không có quyền/,
    );
  }
});

test("speaker replies atomically enforce ownership, pending state and an available event", async () => {
  let updates = 0;
  const before = Date.now();
  const actions = loadActions<EventActions>("src/actions/event-actions.ts", {
    update: () => {
      updates++;
      return {
        set: () => ({
          where: (condition: SQL) => {
            const compiled = new PgDialect().sqlToQuery(condition);
            assert.ok(compiled.params.includes(invitationId));
            assert.ok(compiled.params.includes("member-1"));
            assert.ok(compiled.params.includes("pending"));
            assert.ok(compiled.params.includes("cancelled"));
            assert.ok(compiled.params.includes("completed"));
            assert.match(compiled.sql, /exists\s*\(/);
            assert.match(
              compiled.sql,
              /"events"\."id" = "event_speakers"\."event_id"/,
            );
            assert.match(compiled.sql, /"events"\."end_time" >/);
            const cutoff = compiled.params.find(
              (value) => value instanceof Date,
            ) as Date;
            assert.ok(cutoff.getTime() >= before);
            return { returning: async () => [] };
          },
        }),
      };
    },
  });
  for (const status of ["accepted", "declined"] as const) {
    await assert.rejects(
      actions.respondSpeakerInvitation(invitationId, status),
      /sự kiện không còn nhận phản hồi/,
    );
  }
  assert.equal(updates, 2);
  await assert.rejects(
    actions.respondSpeakerInvitation("invalid", "accepted"),
    /không hợp lệ/,
  );
  assert.equal(updates, 2);
});

test("invalid event identifiers never start a registration transaction", async () => {
  const actions = loadActions<EventActions>(
    "src/actions/event-actions.ts",
    {},
    member("student"),
  );
  await assert.rejects(actions.registerForEvent("invalid"), /không hợp lệ/);
});

test("students and alumni cannot register for draft, cancelled or finished events", async () => {
  for (const role of ["student", "alumni"] as UserRole[]) {
    for (const status of ["draft", "cancelled", "completed", "published"]) {
      const actions = loadActions<EventActions>(
        "src/actions/event-actions.ts",
        {
          transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
            callback({
              select: () => ({
                from: () => ({
                  where: () => ({
                    for: async () => [
                      { id: eventId, status, endTime: new Date(0) },
                    ],
                  }),
                }),
              }),
            }),
        },
        member(role),
      );
      await assert.rejects(
        actions.registerForEvent(eventId),
        /đăng ký|kết thúc/,
      );
    }
  }
});

test("scholarship applications require the student role and an unexpired campaign", async () => {
  for (const role of ["alumni", "employer", "faculty_staff"] as UserRole[]) {
    const actions = loadActions<ScholarshipActions>(
      "src/actions/scholarship-actions.ts",
      {},
      member(role),
    );
    await assert.rejects(
      actions.applyForScholarship(eventId),
      /Không có quyền/,
    );
  }
  for (const status of ["closed", "draft", "open"]) {
    const actions = loadActions<ScholarshipActions>(
      "src/actions/scholarship-actions.ts",
      {
        query: {
          scholarshipCampaigns: {
            findFirst: async () => ({
              id: eventId,
              status,
              applicationDeadline: new Date(0),
            }),
          },
        },
      },
      member("student"),
    );
    await assert.rejects(
      actions.applyForScholarship(eventId),
      /đã đóng|hết hạn/,
    );
  }
});

test("scholarship submissions cannot attach another person's form response", async () => {
  let inserted = false;
  const actions = loadActions<ScholarshipActions>(
    "src/actions/scholarship-actions.ts",
    {
      query: {
        scholarshipCampaigns: {
          findFirst: async () => ({
            id: eventId,
            status: "open",
            applicationDeadline: new Date(Date.now() + 86_400_000),
            applicationFormId: formId,
          }),
        },
        scholarshipApplications: { findFirst: async () => null },
        formResponses: {
          findFirst: async (options: {
            where: { id: string; respondentId: string; formId: string };
          }) => {
            assert.equal(options.where.id, responseId);
            assert.equal(options.where.respondentId, "member-1");
            assert.equal(options.where.formId, formId);
            return null;
          },
        },
      },
      insert: () => {
        inserted = true;
        throw new Error("Unexpected insert");
      },
    },
    member("student"),
  );
  await assert.rejects(
    actions.applyForScholarship(eventId, responseId),
    /hoàn thành biểu mẫu/,
  );
  assert.equal(inserted, false);
});

test("malformed scholarship mutation IDs never query or write to the database", async () => {
  let databaseCalls = 0;
  const database = new Proxy(
    {},
    {
      get: () => {
        databaseCalls++;
        assert.fail("Malformed IDs must not reach database operations");
      },
    },
  );
  for (const role of ["faculty_staff", "admin"] as UserRole[]) {
    const actions = loadActions<ScholarshipActions>(
      "src/actions/scholarship-actions.ts",
      database,
      member(role),
    );
    for (const invalidId of ["invalid", "", "  ", "11111111", null, {}]) {
      const id = invalidId as string;
      await assert.rejects(
        actions.confirmFulfillPledge(id),
        /Mã cam kết không hợp lệ.*tải lại trang/,
      );
      await assert.rejects(
        actions.cancelPledge(id),
        /Mã cam kết không hợp lệ.*tải lại trang/,
      );
      await assert.rejects(
        actions.reviewScholarshipApplication(id, { status: "approved" }),
        /Mã hồ sơ học bổng không hợp lệ.*tải lại trang/,
      );
      await assert.rejects(
        actions.createDonationPledge({
          campaignId: id,
          donorDisplayName: "Nhà tài trợ",
          amount: 100000,
          isAnonymous: false,
        }),
      );
      await assert.rejects(actions.applyForScholarship(id));
    }
    await assert.rejects(
      actions.reviewScholarshipApplication(eventId, {
        status: "fulfilled" as "approved",
      }),
    );
  }
  assert.equal(databaseCalls, 0);
});

test("scholarship mutation role guards run before malformed-ID validation", async () => {
  for (const current of [
    member("student"),
    member("alumni"),
    member("employer"),
    member("admin", "locked"),
    { ...member("faculty_staff"), profile: null },
    null,
  ]) {
    const actions = loadActions<ScholarshipActions>(
      "src/actions/scholarship-actions.ts",
      {},
      current,
    );
    await assert.rejects(
      actions.confirmFulfillPledge("invalid"),
      /Không có quyền/,
    );
    await assert.rejects(actions.cancelPledge("invalid"), /Không có quyền/);
    await assert.rejects(
      actions.reviewScholarshipApplication("invalid", { status: "approved" }),
      /Không có quyền/,
    );
  }
});

test("malformed scholarship review filters return no records before accessing the database", async () => {
  const actions = loadActions<ScholarshipActions>(
    "src/actions/scholarship-actions.ts",
    {},
    member("admin"),
  );
  for (const invalidId of ["invalid", "", "  "]) {
    assert.equal(
      (await actions.getAllApplicationsForReview(invalidId)).length,
      0,
    );
  }
});
