import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import ts from "typescript";

type ContactActions = typeof import("../src/actions/contact-actions");
type Message = { email: string; createdAt: Date };
const requireModule = createRequire(path.join(process.cwd(), "package.json"));

function loadContactActions(db: unknown): ContactActions {
  const dependencies: Record<string, unknown> = {
    "@/db": { db },
    "@/lib/permissions": { requireRole: async () => undefined },
    "@/lib/audit": { logAuditEvent: async () => undefined },
  };
  const output = ts.transpileModule(
    readFileSync("src/actions/contact-actions.ts", "utf8"),
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
    { console, Date },
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
  return actionModule.exports as ContactActions;
}

test("concurrent contact messages respect both hourly limits under a shared transaction lock", async () => {
  const now = new Date();
  const old = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const scenarios: {
    messages: Message[];
    emails: string[];
    expectedTotal: number;
  }[] = [
    {
      messages: [
        { email: "alice@example.com", createdAt: now },
        { email: "alice@example.com", createdAt: now },
        { email: "alice@example.com", createdAt: old },
      ],
      emails: [" ALICE@EXAMPLE.COM ", "alice@example.com"],
      expectedTotal: 4,
    },
    {
      messages: [
        ...Array.from({ length: 59 }, (_, index) => ({
          email: `person-${index}@example.com`,
          createdAt: now,
        })),
        { email: "expired@example.com", createdAt: old },
      ],
      emails: ["alice@example.com", "bob@example.com"],
      expectedTotal: 61,
    },
  ];

  for (const scenario of scenarios) {
    const messages = [...scenario.messages];
    const scopes: unknown[] = [];
    let lockTail = Promise.resolve();
    let transactions = 0;
    const db = {
      transaction: async (
        callback: (tx: unknown) => Promise<unknown>,
        config: { isolationLevel?: string },
      ) => {
        assert.equal(config.isolationLevel, "read committed");
        transactions++;
        let release: (() => void) | undefined;
        let locked = false;
        const tx = {
          execute: async (condition: SQL) => {
            const query = new PgDialect().sqlToQuery(condition);
            assert.match(query.sql, /pg_advisory_xact_lock/);
            scopes.push(query.params[0]);
            const previous = lockTail;
            lockTail = new Promise<void>((resolve) => {
              release = resolve;
            });
            await previous;
            locked = true;
          },
          select: () => ({
            from: () => ({
              where: async (condition: SQL) => {
                assert.equal(locked, true);
                const { params } = new PgDialect().sqlToQuery(condition);
                const email = params.length > 1 ? params[0] : undefined;
                const sinceValue = params.at(-1);
                const since =
                  sinceValue instanceof Date
                    ? sinceValue
                    : new Date(String(sinceValue));
                assert.ok(Number.isFinite(since.getTime()));
                const value = messages.filter(
                  (message) =>
                    message.createdAt >= since &&
                    (!email || message.email === email),
                ).length;
                return [{ value }];
              },
            }),
          }),
          insert: () => ({
            values: async ({ email }: { email: string }) => {
              assert.equal(locked, true);
              await new Promise<void>((resolve) => setImmediate(resolve));
              messages.push({ email, createdAt: new Date() });
            },
          }),
        };
        try {
          return await callback(tx);
        } finally {
          release?.();
        }
      },
    };
    const actions = loadContactActions(db);
    const results = await Promise.allSettled(
      scenario.emails.map((email) =>
        actions.submitContactMessage({
          name: "Sinh viên",
          email,
          subject: "Liên hệ với Khoa",
          message: "Tôi cần tư vấn thông tin học bổng.",
        }),
      ),
    );
    assert.equal(
      results.filter((result) => result.status === "fulfilled").length,
      1,
    );
    const rejected = results.find((result) => result.status === "rejected");
    assert.ok(rejected?.status === "rejected");
    assert.match(String(rejected.reason), /Vui lòng thử lại sau/);
    assert.equal(messages.length, scenario.expectedTotal);
    assert.equal(transactions, 2);
    assert.deepEqual(scopes, [
      "connect-alumni:contact-messages",
      "connect-alumni:contact-messages",
    ]);
    assert.equal(messages.at(-1)?.email, "alice@example.com");
  }
});
