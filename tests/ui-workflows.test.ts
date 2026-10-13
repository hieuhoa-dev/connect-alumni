import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { ScholarshipResponseDetails } from "../src/app/faculty-admin/scholarships/applications/review/response-details";
import {
  formatLocalDateInput,
  formatLocalDateTimeInput,
} from "../src/lib/date-time";

const requireModule = createRequire(path.join(process.cwd(), "package.json"));
const loadComponent = <T>(
  file: string,
  dependencies: Record<string, unknown>,
): T => {
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  const execute = runInNewContext(
    `(function(module, exports, require) { ${code}\n })`,
  );
  execute(
    module,
    module.exports,
    (id: string) =>
      dependencies[id] ??
      requireModule(
        id.startsWith("@/") ? path.resolve("src", id.slice(2)) : id,
      ),
  );
  return module.exports as T;
};

type ElementNode = {
  type: unknown;
  props: {
    children?: unknown;
    onSubmit?: (event: { preventDefault: () => void }) => Promise<void>;
    onValueChange?: (value: string) => void;
  };
};
const findElement = (
  element: unknown,
  type: string,
): ElementNode | undefined => {
  if (!element || typeof element !== "object" || !("props" in element))
    return undefined;
  const node = element as ElementNode;
  if (node.type === type) return node;
  for (const child of [node.props.children].flat()) {
    const found = findElement(child, type);
    if (found) return found;
  }
  return undefined;
};

test("local date inputs preserve wall-clock time instead of shifting to UTC", () => {
  const previousZone = process.env.TZ;
  process.env.TZ = "Asia/Ho_Chi_Minh";
  try {
    const date = new Date("2026-10-12T09:30:00+07:00");
    assert.equal(formatLocalDateTimeInput(date), "2026-10-12T09:30");
    assert.equal(
      new Date(formatLocalDateTimeInput(date)).getTime(),
      date.getTime(),
    );
    assert.equal(
      formatLocalDateInput(new Date("2026-10-12T00:30:00+07:00")),
      "2026-10-12",
    );
  } finally {
    if (previousZone === undefined) delete process.env.TZ;
    else process.env.TZ = previousZone;
  }
});

test("campaign creation returns staff to campaign management after saving", async () => {
  const stateValues = [
    false,
    "Học bổng vượt khó",
    "Hỗ trợ sinh viên khó khăn",
    "10000000",
    "2030-10-12T09:00",
    "none",
    "open",
  ];
  let stateIndex = 0;
  const routes: string[] = [];
  let saved = false;
  const { CampaignForm } = loadComponent<
    typeof import("../src/app/faculty-admin/scholarships/campaigns/new/campaign-form")
  >("src/app/faculty-admin/scholarships/campaigns/new/campaign-form.tsx", {
    react: {
      ...React,
      useState: () => [stateValues[stateIndex++], () => undefined],
    },
    "next/navigation": {
      useRouter: () => ({
        push: (route: string) => routes.push(route),
        refresh: () => undefined,
      }),
    },
    "@/actions/scholarship-actions": {
      createScholarshipCampaign: async () => {
        saved = true;
      },
    },
    "@/components/ui/toast": { toast: { add: () => undefined } },
  });
  const element = CampaignForm({ availableForms: [] });
  const form = findElement(element, "form");
  assert.ok(form?.props.onSubmit);
  await form.props.onSubmit({ preventDefault: () => undefined });
  assert.equal(saved, true);
  assert.deepEqual(routes, ["/faculty-admin/scholarships/campaigns"]);
});

test("attendance controls persist the selected participant status and refresh the server table", async () => {
  const mutations: unknown[] = [];
  let refreshes = 0;
  const { AttendanceControls } = loadComponent<
    typeof import("../src/app/faculty-admin/events/[id]/attendance/attendance-controls")
  >("src/app/faculty-admin/events/[id]/attendance/attendance-controls.tsx", {
    "next/navigation": {
      useRouter: () => ({
        refresh: () => {
          refreshes++;
        },
      }),
    },
    "@/hooks/use-events": {
      useMarkAttendance: () => ({
        mutateAsync: async (value: unknown) => {
          mutations.push(value);
        },
        isPending: false,
      }),
    },
  });
  const element = AttendanceControls({
    registrationId: "registration-1",
    status: "registered",
    participantName: "Nguyễn Minh Anh",
  }) as ElementNode;
  element.props.onValueChange?.("attended");
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(
    JSON.stringify(mutations),
    JSON.stringify([{ registrationId: "registration-1", status: "attended" }]),
  );
  assert.equal(refreshes, 1);
  element.props.onValueChange?.("invalid-status");
  assert.equal(mutations.length, 1);
});

test("admin role selects show Vietnamese labels on the initial server render", () => {
  const { UserRowActions } = loadComponent<
    typeof import("../src/app/faculty-admin/users/user-row-actions")
  >("src/app/faculty-admin/users/user-row-actions.tsx", {
    "next/navigation": { useRouter: () => ({ refresh: () => undefined }) },
    "@/actions/auth-actions": {},
    "@/components/ui/toast": { toast: { add: () => undefined } },
  });
  const html = renderToStaticMarkup(
    React.createElement(UserRowActions, {
      userId: "student-1",
      currentRole: "student",
      currentStatus: "active",
      isSelf: false,
    }),
  );
  assert.ok(html.includes("Sinh viên"));
  assert.ok(!html.includes(">student</span>"));
});

test("scholarship reviewers can read ordered answers, zero ratings and safe proof links", () => {
  const html = renderToStaticMarkup(
    React.createElement(ScholarshipResponseDetails, {
      answers: [
        {
          id: "second",
          answerValue: 0,
          fileUrl: null,
          question: { label: "Điểm số", orderIndex: 1 },
        },
        {
          id: "first",
          answerValue: "<script>alert(1)</script>",
          fileUrl: "javascript:alert(1)",
          question: { label: "Hoàn cảnh", orderIndex: 0 },
        },
        {
          id: "proof",
          answerValue: null,
          fileUrl: "https://example.com/proof.pdf",
          question: { label: "Minh chứng", orderIndex: 2 },
        },
      ],
    }),
  );
  assert.ok(html.indexOf("Hoàn cảnh") < html.indexOf("Điểm số"));
  assert.ok(html.includes(">0</dd>"));
  assert.ok(html.includes('href="https://example.com/proof.pdf"'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(!html.includes("<script>"));
});
