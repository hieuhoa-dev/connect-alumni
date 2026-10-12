import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

type NotificationModule = typeof import("../src/lib/notifications");
const requireModule = createRequire(path.join(process.cwd(), "package.json"));

test("optional unavailable email queue does not block a saved in-app notification", async () => {
  const delays: number[] = [];
  const listeners: string[] = [];
  const errors: unknown[] = [];
  let emailAttempted = false;
  class UnavailableQueue {
    on(event: string) {
      listeners.push(event);
      return this;
    }
    add() {
      emailAttempted = true;
      return new Promise<never>(() => {});
    }
  }
  const dependencies: Record<string, unknown> = {
    bullmq: { Queue: UnavailableQueue },
    "@/db": {
      db: {
        insert: () => ({
          values: () => ({ returning: async () => [{ id: "notice-1" }] }),
        }),
      },
    },
    "@/lib/redis": {
      isRedisConfigured: () => true,
      getRedisClient: () => ({}),
    },
  };
  const output = ts.transpileModule(
    readFileSync("src/lib/notifications.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    },
  ).outputText;
  const notificationModule = { exports: {} };
  const execute = runInNewContext(
    `(function(module, exports, require) { ${output}\n })`,
    {
      console: {
        error: (...values: unknown[]) => errors.push(values),
        warn: () => {},
      },
      setTimeout: (callback: () => void, delay: number) => {
        delays.push(delay);
        return setTimeout(callback, 0);
      },
      clearTimeout,
    },
  ) as (
    module: typeof notificationModule,
    exports: object,
    require: (id: string) => unknown,
  ) => void;
  execute(notificationModule, notificationModule.exports, (id) => {
    if (id in dependencies) return dependencies[id];
    return requireModule(
      id.startsWith("@/") ? path.resolve("src", `${id.slice(2)}.ts`) : id,
    );
  });
  const notifications = notificationModule.exports as NotificationModule;
  const created = await notifications.sendNotification({
    userId: "student-1",
    type: "test",
    title: "Thông báo xét duyệt",
    body: "Hồ sơ đã được tiếp nhận",
    sendEmail: true,
  });
  assert.equal(created?.id, "notice-1");
  assert.equal(emailAttempted, true);
  assert.deepEqual(listeners, ["error"]);
  assert.deepEqual(delays, [2000]);
  assert.equal(errors.length, 1);
});
