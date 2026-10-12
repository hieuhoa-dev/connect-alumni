import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import * as reactTable from "@tanstack/react-table";
import {
  type ColumnDef,
  constructTable,
  type TableOptions,
} from "@tanstack/table-core";
import { storeReactivityBindings } from "@tanstack/table-core/store-reactivity-bindings";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import type {
  DataTable,
  DataTableFeatures,
} from "../src/components/shared/data-table";

type RecordRow = { name: string | null; batch: number; registeredAt: Date };
type Options = TableOptions<DataTableFeatures, RecordRow>;
const requireDependency = createRequire(join(process.cwd(), "package.json"));
let renderedOptions: Options | undefined;

const primitive = (element: string) => (props: Record<string, unknown>) =>
  React.createElement(element, props);
const dependencies: Record<string, unknown> = {
  "@tanstack/react-table": {
    ...reactTable,
    useTable: (options: Options) => {
      renderedOptions = options;
      return reactTable.useTable(options);
    },
  },
  "@/components/ui/button": { Button: primitive("button") },
  "@/components/ui/input": { Input: primitive("input") },
  "@/components/ui/table": {
    Table: primitive("table"),
    TableBody: primitive("tbody"),
    TableCell: primitive("td"),
    TableHead: primitive("th"),
    TableHeader: primitive("thead"),
    TableRow: primitive("tr"),
  },
};
const fileName = join(process.cwd(), "src/components/shared/data-table.tsx");
const code = ts.transpileModule(readFileSync(fileName, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
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
  },
  { filename: fileName },
);
const Component = (module.exports as { DataTable: typeof DataTable }).DataTable;
const columns: ColumnDef<DataTableFeatures, RecordRow>[] = [
  {
    accessorKey: "name",
    header: "Tên",
    cell: ({ getValue }) => String(getValue() ?? ""),
  },
  { accessorKey: "batch", header: "Khóa" },
  {
    accessorKey: "registeredAt",
    header: "Ngày tham gia",
    cell: ({ getValue }) => (getValue() as Date).toISOString(),
  },
];

const tableWithRows = (data: RecordRow[]) => {
  renderToStaticMarkup(
    React.createElement(Component, { data, columns, searchKey: "name" }),
  );
  assert.ok(renderedOptions);
  // Use the component's actual feature registry and defaults in the headless engine.
  const {
    state: _state,
    onSortingChange: _onSortingChange,
    onColumnFiltersChange: _onColumnFiltersChange,
    ...options
  } = renderedOptions;
  const headlessFeatures = reactTable.tableFeatures({
    ...options.features,
    coreReactivityFeature: storeReactivityBindings(),
  });
  return constructTable<DataTableFeatures, RecordRow>({
    ...options,
    features: headlessFeatures,
  });
};

const row = (
  name: string | null,
  batch = 2021,
  registeredAt = new Date("2026-10-01T08:00:00Z"),
): RecordRow => ({ name, batch, registeredAt });

test("shared table auto-sorts plain text without changing alphabetical order for mixed case", () => {
  const table = tableWithRows([
    row("beta"),
    row("Alpha"),
    row("delta"),
    row("Charlie"),
  ]);
  table.setSorting([{ id: "name", desc: false }]);
  assert.deepEqual(
    table.getRowModel().rows.map((item) => item.original.name),
    ["Alpha", "beta", "Charlie", "delta"],
  );
  table.setSorting([{ id: "name", desc: true }]);
  assert.deepEqual(
    table.getRowModel().rows.map((item) => item.original.name),
    ["delta", "Charlie", "beta", "Alpha"],
  );
});

test("shared search matches numeric values and excludes empty values", () => {
  const table = tableWithRows([
    row(null, 2021),
    row(null, 2022),
    row(null, 2021),
  ]);
  table.getColumn("batch")?.setFilterValue("2021");
  assert.equal(table.getRowModel().rows.length, 2);
  table.getColumn("batch")?.setFilterValue("");
  table.getColumn("name")?.setFilterValue("Mai");
  assert.equal(table.getRowModel().rows.length, 0);
});

test("shared table filters all rows before pagination and resets search to the first page", async () => {
  const table = tableWithRows(
    Array.from({ length: 25 }, (_, index) =>
      row(`Sinh viên ${index + 1}`, index % 2 ? 2022 : 2021),
    ),
  );
  assert.equal(table.getRowModel().rows.length, 10);
  assert.equal(table.getPageCount(), 3);
  table.nextPage();
  assert.equal(table.getRowModel().rows[0].original.name, "Sinh viên 11");
  table.getColumn("name")?.setFilterValue("SINH VIÊN 2");
  // The library schedules automatic page resets after the filtered model updates.
  table.getFilteredRowModel();
  await Promise.resolve();
  assert.equal(table.getRowModel().rows.length, 7);
  assert.equal(table.getPageCount(), 1);
  assert.equal(table.atoms.pagination.get().pageIndex, 0);
  table.getColumn("name")?.setFilterValue("");
  assert.equal(table.getPageCount(), 3);
});

test("shared table keeps natural identifiers, numeric values, and dates in correct order", () => {
  const table = tableWithRows([
    row("SV10", 2022, new Date("2026-10-02T08:00:00Z")),
    row("SV2", 2021, new Date("2026-09-01T08:00:00Z")),
    row("SV1", 2023, new Date("2026-10-02T08:00:00Z")),
  ]);
  table.setSorting([{ id: "name", desc: false }]);
  assert.deepEqual(
    table.getRowModel().rows.map((item) => item.original.name),
    ["SV1", "SV2", "SV10"],
  );
  table.setSorting([{ id: "batch", desc: false }]);
  assert.deepEqual(
    table.getRowModel().rows.map((item) => item.original.batch),
    [2021, 2022, 2023],
  );
  table.setSorting([{ id: "registeredAt", desc: false }]);
  assert.deepEqual(
    table.getRowModel().rows.map((item) => item.original.name),
    ["SV2", "SV10", "SV1"],
  );
});

test("shared table renders its empty state on the server with no data", () => {
  const markup = renderToStaticMarkup(
    React.createElement(Component, { columns }),
  );
  assert.match(markup, /Không tìm thấy dữ liệu phù hợp/);
  assert.match(markup, /0 bản ghi/);
});
