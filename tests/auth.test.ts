import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import ts from "typescript";
import { z } from "zod";
import * as schema from "../src/db/schema";
import type { UserRole } from "../src/lib/permissions";
import { profileUpdateSchema } from "../src/validators/profile-schema";

const requireDependency = createRequire(join(process.cwd(), "package.json"));

// Load the real server modules while replacing request/database dependencies.
// These checks never connect to or mutate the project's PostgreSQL database.
const loadServerModule = <T>(
  path: string,
  dependencies: Record<string, unknown>,
): T => {
  const fileName = join(process.cwd(), path);
  const code = ts.transpileModule(readFileSync(fileName, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName,
  }).outputText;
  const module = { exports: {} };
  runInNewContext(
    code,
    {
      module,
      exports: module.exports,
      require: (specifier: string) =>
        dependencies[specifier] ?? requireDependency(specifier),
      process,
      console,
      Headers,
    },
    { filename: fileName },
  );
  return module.exports as T;
};

const memoryAuthFixture = () => {
  const records: Record<string, Record<string, unknown>[]> = {
    user: [],
    account: [],
    session: [],
    verification: [],
  };
  let locked = false;
  const { auth } = loadServerModule<{ auth: ReturnType<typeof betterAuth> }>(
    "src/lib/auth.ts",
    {
      "better-auth": {
        betterAuth: (options: Parameters<typeof betterAuth>[0]) =>
          betterAuth({
            ...options,
            baseURL: "http://localhost:3000",
            secret: "auth-regression-test-secret-at-least-32-characters",
          }),
      },
      "better-auth/adapters/drizzle": {
        drizzleAdapter: (
          _database: unknown,
          options: { transaction: boolean },
        ) => {
          assert.equal(options.transaction, true);
          return memoryAdapter(records);
        },
      },
      "better-auth/api": { APIError },
      "better-auth/next-js": { nextCookies },
      "@/db": {
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: async () => (locked ? [{ status: "locked" }] : []),
              }),
            }),
          }),
        },
      },
      "@/db/schema": schema,
    },
  );
  return {
    auth,
    records,
    setLocked: () => {
      locked = true;
    },
  };
};

test("HTTP signup cannot bypass profile creation; the server signup API still works", async () => {
  const { auth, records, setLocked } = memoryAuthFixture();

  const request = () =>
    new Request("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Nguyễn Thị Mai",
        email: "mai@example.edu.vn",
        password: "Password123!",
      }),
    });
  assert.equal((await auth.handler(request())).status, 404);
  assert.equal(records.user.length, 0);

  const result = await auth.api.signUpEmail({
    body: {
      name: "Nguyễn Thị Mai",
      email: "mai@example.edu.vn",
      password: "Password123!",
    },
  });
  assert.ok(result.user.id);
  assert.equal(records.user.length, 1);
  assert.equal(records.account.length, 1);
  assert.equal(records.session.length, 1);

  setLocked();
  await assert.rejects(
    auth.api.signInEmail({
      body: { email: "mai@example.edu.vn", password: "Password123!" },
    }),
    (error: unknown) => error instanceof APIError && error.statusCode === 403,
  );
  assert.equal(
    records.session.length,
    1,
    "locking an account must prevent new sessions",
  );

  // A denied session must roll back all preceding native signup writes.
  await assert.rejects(
    auth.api.signUpEmail({
      body: {
        name: "Trần Minh Khang",
        email: "khang@example.edu.vn",
        password: "Password123!",
      },
    }),
  );
  assert.equal(records.user.length, 1);
  assert.equal(records.account.length, 1);
});

test("password change rejects an incorrect password, rotates its cookie, and invalidates old sessions", async () => {
  const { auth, records } = memoryAuthFixture();
  const signup = await auth.api.signUpEmail({
    body: {
      name: "Nguyễn Thị Mai",
      email: "mai@example.edu.vn",
      password: "Password123!",
    },
    returnHeaders: true,
  });
  const cookie = signup.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  assert.match(cookie, /better-auth\.session_token=/);
  const requestHeaders = new Headers({
    cookie,
    origin: "http://localhost:3000",
  });
  await auth.api.signInEmail({
    body: { email: "mai@example.edu.vn", password: "Password123!" },
  });
  assert.equal(records.session.length, 2);
  await assert.rejects(
    auth.api.changePassword({
      headers: requestHeaders,
      body: {
        currentPassword: "WrongPassword!",
        newPassword: "NewPassword123!",
        revokeOtherSessions: true,
      },
    }),
    (error: unknown) =>
      error instanceof APIError && error.body?.code === "INVALID_PASSWORD",
  );
  assert.equal(records.session.length, 2);
  const changed = await auth.api.changePassword({
    headers: requestHeaders,
    body: {
      currentPassword: "Password123!",
      newPassword: "NewPassword123!",
      revokeOtherSessions: true,
    },
    returnHeaders: true,
  });
  assert.equal(records.session.length, 1);
  const newCookie = changed.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  assert.notEqual(newCookie, cookie);
  assert.match(newCookie, /better-auth\.session_token=/);
  assert.equal(await auth.api.getSession({ headers: requestHeaders }), null);
  assert.ok(
    await auth.api.getSession({ headers: new Headers({ cookie: newCookie }) }),
  );
  await assert.rejects(
    auth.api.signInEmail({
      body: { email: "mai@example.edu.vn", password: "Password123!" },
    }),
  );
  assert.ok(
    await auth.api.signInEmail({
      body: { email: "mai@example.edu.vn", password: "NewPassword123!" },
    }),
  );
});

test("profile years reject fractions, NaN, and graduation before admission", () => {
  const input = {
    fullName: "Nguyễn Thị Mai",
    batchYear: 2021,
    graduationYear: 2025,
  };
  assert.equal(profileUpdateSchema.safeParse(input).success, true);
  for (const batchYear of [
    2021.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    1989,
  ]) {
    assert.equal(
      profileUpdateSchema.safeParse({ ...input, batchYear }).success,
      false,
    );
  }
  assert.equal(
    profileUpdateSchema.safeParse({ ...input, graduationYear: 2020 }).success,
    false,
  );
  assert.equal(
    profileUpdateSchema.parse({ fullName: "Nguyễn Thị Mai" }).batchYear,
    null,
  );
});

test("profile avatars require a complete http or https URL", () => {
  const input = { fullName: "Nguyễn Thị Mai" };
  assert.equal(
    profileUpdateSchema.safeParse({
      ...input,
      avatarUrl: "https://images.example.edu.vn/mai.jpg",
    }).success,
    true,
  );
  for (const avatarUrl of [
    "https://",
    "http://",
    "javascript:alert(1)",
    "data:image/png;base64,AA==",
  ]) {
    assert.equal(
      profileUpdateSchema.safeParse({ ...input, avatarUrl }).success,
      false,
    );
  }
});

type AuthActions = typeof import("../src/actions/auth-actions");

const actionFixture = () => {
  const calls: { table: unknown; values?: Record<string, unknown> }[] = [];
  let signups = 0;
  let signouts = 0;
  let signupFailure: unknown;
  let failProfileInsert = false;
  const activeUser = { user: { id: "current-user" }, role: "faculty_staff" };
  const database = {
    insert: (table: unknown) => ({
      values: (values: Record<string, unknown>) => ({
        returning: async () => {
          calls.push({ table, values });
          if (failProfileInsert)
            throw new Error("Simulated profile storage failure");
          return [values];
        },
      }),
    }),
    delete: (table: unknown) => ({
      where: async () => {
        calls.push({ table });
      },
    }),
    update: (table: unknown) => ({
      set: (values: Record<string, unknown>) => ({
        where: () => {
          calls.push({ table, values });
          return {
            returning: async () => [{ ...values, userId: "current-user" }],
          };
        },
      }),
    }),
    transaction: async <T>(fn: (tx: unknown) => Promise<T>) => fn(database),
  };
  const actions = loadServerModule<AuthActions>("src/actions/auth-actions.ts", {
    "next/headers": {
      headers: async () => new Headers({ "user-agent": "regression-test" }),
    },
    "next/cache": { revalidatePath: () => {} },
    zod: { z },
    "@/db": { db: database },
    "@/db/schema": schema,
    "@/lib/audit": { logAuditEvent: async () => {} },
    "@/lib/auth": {
      auth: {
        api: {
          signUpEmail: async () => {
            signups += 1;
            if (signupFailure) throw signupFailure;
            return { user: { id: "new-user", email: "mai@example.edu.vn" } };
          },
          signOut: async ({ headers }: { headers: Headers }) => {
            assert.equal(headers.get("cookie"), null);
            signouts += 1;
          },
        },
      },
    },
    "@/lib/permissions": {
      ForbiddenError: class extends Error {},
      requireActiveUser: async () => activeUser,
      requireRole: async () => activeUser,
    },
    "@/validators/profile-schema": { profileUpdateSchema },
  });
  return {
    actions,
    calls,
    signups: () => signups,
    signouts: () => signouts,
    failSignup: (error: unknown) => {
      signupFailure = error;
    },
    failProfileInsert: () => {
      failProfileInsert = true;
    },
  };
};

test("registration validates privileged roles and invalid academic data before creating accounts", async () => {
  const fixture = actionFixture();
  const input = {
    name: "Nguyễn Thị Mai",
    email: "mai@example.edu.vn",
    password: "Password123!",
    role: "student" as const,
    studentCode: "21110001",
    batchYear: 2021,
  };
  for (const invalid of [
    { ...input, role: "admin" } as never,
    { ...input, studentCode: "" },
    { ...input, batchYear: 2021.5 },
    { ...input, graduationYear: 2020 },
  ]) {
    const result = await fixture.actions.registerWithProfile(invalid);
    assert.ok("error" in result && result.error);
  }
  assert.equal(fixture.signups(), 0);
  assert.equal(fixture.calls.length, 0);
});

test("registration removes a created auth user when storing its profile fails", async () => {
  const fixture = actionFixture();
  fixture.failProfileInsert();
  const result = await fixture.actions.registerWithProfile({
    name: "Nguyễn Thị Mai",
    email: "mai@example.edu.vn",
    password: "Password123!",
    role: "alumni",
  });
  assert.ok("error" in result);
  assert.equal(fixture.signups(), 1);
  assert.equal(fixture.signouts(), 1);
  assert.equal(
    fixture.calls.at(-1)?.table,
    schema.user,
    "deleting the auth user also cascades to accounts and sessions",
  );
});

test("an existing email returns an actionable registration error without storing a new profile", async () => {
  const fixture = actionFixture();
  fixture.failSignup(
    new APIError("UNPROCESSABLE_ENTITY", {
      code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
      message: "User already exists. Use another email.",
    }),
  );
  const result = await fixture.actions.registerWithProfile({
    name: "Nguyễn Thị Mai",
    email: "mai@example.edu.vn",
    password: "Password123!",
    role: "alumni",
  });
  assert.ok("error" in result);
  assert.match(result.error, /Email này đã được đăng ký/);
  assert.equal(fixture.calls.length, 0);
  assert.equal(fixture.signouts(), 0);
});

test("native signout expires signup cookies even after its session no longer exists", async () => {
  const { auth, records } = memoryAuthFixture();
  await auth.api.signUpEmail({
    body: {
      name: "Nguyễn Thị Mai",
      email: "mai@example.edu.vn",
      password: "Password123!",
    },
  });
  records.session.splice(0);
  const result = await auth.api.signOut({
    headers: new Headers(),
    returnHeaders: true,
  });
  assert.ok(
    result.headers
      .getSetCookie()
      .some((value) => /better-auth\.session_token=;.*Max-Age=0/i.test(value)),
  );
});

test("profile validation returns a serializable message without writing invalid data", async () => {
  const fixture = actionFixture();
  const result = await fixture.actions.updateCurrentUserProfile({
    fullName: "Nguyễn Thị Mai",
    batchYear: 2021,
    graduationYear: 2020,
  });
  assert.ok("error" in result);
  assert.match(result.error, /Năm tốt nghiệp/);
  assert.equal(fixture.calls.length, 0);
  assert.equal(JSON.parse(JSON.stringify(result)).error, result.error);
});

test("admin actions enforce self-lock and self-role restrictions on the server", async () => {
  const fixture = actionFixture();
  await assert.rejects(
    fixture.actions.adminToggleUserLock("current-user", true),
    /Không thể tự khóa/,
  );
  await assert.rejects(
    fixture.actions.adminUpdateUserRole("current-user", "student"),
    /Không thể tự thay đổi/,
  );
  assert.equal(fixture.calls.length, 0);
});

type Permissions = typeof import("../src/lib/permissions");

const permissionsFixture = (
  role: UserRole | null,
  status = "active",
  authenticated = true,
) => {
  const permissions = loadServerModule<Permissions>("src/lib/permissions.ts", {
    "next/headers": { headers: async () => new Headers() },
    "next/navigation": {
      redirect: (path: string) => {
        throw new Error(`Redirect:${path}`);
      },
    },
    "@/db": {
      db: {
        select: () => ({
          from: () => ({ where: async () => (role ? [{ role, status }] : []) }),
        }),
      },
    },
    "@/db/schema": schema,
    "@/lib/auth": {
      auth: {
        api: {
          getSession: async () =>
            authenticated
              ? { user: { id: "current-user" }, session: {} }
              : null,
        },
      },
    },
  });
  return permissions;
};

test("orphaned, locked, and unauthenticated accounts cannot pass active-user or role guards", async () => {
  for (const fixture of [
    permissionsFixture(null),
    permissionsFixture("student", "locked"),
    permissionsFixture("admin", "locked"),
    permissionsFixture("student", "active", false),
  ]) {
    await assert.rejects(fixture.requireActiveUser());
    await assert.rejects(fixture.requireRole("student"));
  }
  for (const role of [
    "student",
    "alumni",
    "employer",
    "faculty_staff",
    "admin",
  ] as const) {
    const fixture = permissionsFixture(role);
    assert.equal((await fixture.requireRole(role)).role, role);
  }
  await assert.rejects(
    permissionsFixture("student").requireRole("faculty_staff"),
  );
});

test("dashboard redirects all five roles correctly and denies locked or incomplete accounts", async () => {
  const destinations = {
    student: "/student/dashboard",
    alumni: "/student/dashboard",
    employer: "/employer/dashboard",
    faculty_staff: "/faculty-admin/dashboard",
    admin: "/faculty-admin/dashboard",
  } as const;
  for (const [role, destination] of Object.entries(destinations)) {
    const fixture = permissionsFixture(role as UserRole);
    const { default: page } = loadServerModule<{
      default: () => Promise<never>;
    }>("src/app/dashboard/page.tsx", {
      "next/navigation": {
        redirect: (path: string) => {
          throw new Error(`Redirect:${path}`);
        },
      },
      "@/lib/permissions": fixture,
    });
    await assert.rejects(page(), new RegExp(`Redirect:${destination}`));
  }
  await assert.rejects(
    permissionsFixture("student", "active", false).requireRoleOrRedirect(
      "student",
    ),
    /Redirect:\/login/,
  );
  await assert.rejects(
    permissionsFixture("employer", "locked").requireRoleOrRedirect("employer"),
    /Redirect:\/$/,
  );
  await assert.rejects(
    permissionsFixture(null).requireRoleOrRedirect("student"),
    /Redirect:\/$/,
  );
});

test("editing a faculty profile preserves its hidden academic fields", async () => {
  const fixture = actionFixture();
  await fixture.actions.updateCurrentUserProfile({
    fullName: "Nguyễn Thị Mai",
    studentCode: "",
    batchYear: null,
    graduationYear: null,
  });
  const change = fixture.calls.find(
    (call) => call.table === schema.profiles,
  )?.values;
  assert.ok(change);
  assert.equal("studentCode" in change, false);
  assert.equal("batchYear" in change, false);
  assert.equal("graduationYear" in change, false);
  assert.equal(
    fixture.calls.find((call) => call.table === schema.user)?.values?.name,
    "Nguyễn Thị Mai",
  );
});

test("locking revokes existing sessions and rejects non-boolean lock input", async () => {
  const fixture = actionFixture();
  await assert.rejects(
    fixture.actions.adminToggleUserLock("target-user", "false" as never),
  );
  assert.equal(fixture.calls.length, 0);
  await fixture.actions.adminToggleUserLock("target-user", true);
  assert.equal(
    fixture.calls.find((call) => call.table === schema.profiles)?.values
      ?.status,
    "locked",
  );
  assert.ok(fixture.calls.some((call) => call.table === schema.session));
});
