import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import ts from "typescript";
import { getInternalHref } from "../src/lib/internal-href";

const requireDependency = createRequire(
  path.join(process.cwd(), "package.json"),
);
const notificationId = "11111111-1111-4111-8111-111111111111";
type NotificationActions = typeof import("../src/actions/notification-actions");

const notificationFixture = (found = true) => {
  const predicates: SQL[] = [];
  const updates: unknown[] = [];
  let authorized = true;
  const db = {
    update: () => ({
      set: (values: unknown) => {
        updates.push(values);
        return {
          where: (condition: SQL) => {
            predicates.push(condition);
            return {
              returning: async () => (found ? [{ id: notificationId }] : []),
            };
          },
        };
      },
    }),
    delete: () => ({
      where: (condition: SQL) => {
        predicates.push(condition);
        return {
          returning: async () => (found ? [{ id: notificationId }] : []),
        };
      },
    }),
  };
  const code = ts.transpileModule(
    readFileSync("src/actions/notification-actions.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const module = { exports: {} };
  runInNewContext(code, {
    module,
    exports: module.exports,
    require: (specifier: string) => {
      if (specifier === "@/db") return { db };
      if (specifier === "@/lib/permissions")
        return {
          requireActiveUser: async () => {
            if (!authorized) throw new Error("Tài khoản đã bị khóa");
            return { user: { id: "notification-owner" } };
          },
        };
      return requireDependency(
        specifier.startsWith("@/")
          ? path.resolve("src", `${specifier.slice(2)}.ts`)
          : specifier,
      );
    },
  });
  return {
    actions: module.exports as NotificationActions,
    predicates,
    updates,
    deny: () => {
      authorized = false;
    },
  };
};

test("notification links and login callbacks accept only safe application paths", () => {
  for (const value of [
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/news\n",
    "/ news",
    "javascript:alert(1)",
    null,
    3,
  ])
    assert.equal(getInternalHref(value), null);
  for (const value of [
    "/",
    "/news?search=học+bổng",
    "/account/notifications?page=2",
    "/about#ve-truong",
  ])
    assert.equal(getInternalHref(value), value);
});

test("notification updates and deletes always use the current session owner", async () => {
  const fixture = notificationFixture();
  await fixture.actions.markNotificationRead(notificationId, false);
  await fixture.actions.deleteNotification(notificationId);
  assert.equal(fixture.predicates.length, 2);
  for (const predicate of fixture.predicates) {
    const query = new PgDialect().sqlToQuery(predicate);
    assert.deepEqual(query.params, [notificationId, "notification-owner"]);
    assert.ok(query.sql.includes('"user_id"'));
  }
  assert.equal((fixture.updates[0] as { isRead: boolean }).isRead, false);
});

test("notification actions reject malformed IDs, non-boolean states and inactive sessions before writes", async () => {
  const fixture = notificationFixture();
  await assert.rejects(
    fixture.actions.markNotificationRead("broken-id"),
    /Không tìm thấy/,
  );
  await assert.rejects(
    fixture.actions.deleteNotification("broken-id"),
    /Không tìm thấy/,
  );
  await assert.rejects(
    fixture.actions.markNotificationRead(notificationId, "false" as never),
    /không hợp lệ/,
  );
  assert.equal(fixture.updates.length, 0);
  assert.equal(fixture.predicates.length, 0);
  fixture.deny();
  await assert.rejects(
    fixture.actions.markNotificationRead(notificationId),
    /bị khóa/,
  );
  await assert.rejects(
    fixture.actions.deleteNotification(notificationId),
    /bị khóa/,
  );
  assert.equal(fixture.updates.length, 0);
});

test("notification actions report missing or foreign-owned records without claiming success", async () => {
  const fixture = notificationFixture(false);
  await assert.rejects(
    fixture.actions.markNotificationRead(notificationId),
    /Không tìm thấy/,
  );
  await assert.rejects(
    fixture.actions.deleteNotification(notificationId),
    /Không tìm thấy/,
  );
});
