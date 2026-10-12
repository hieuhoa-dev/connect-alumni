import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChartStyle } from "../src/components/ui/chart";
import { Slider } from "../src/components/ui/slider";

test("scalar sliders render one thumb during server rendering", () => {
  for (const props of [{ value: 50 }, { defaultValue: 25 }, {}]) {
    const html = renderToStaticMarkup(createElement(Slider, props));
    assert.equal(html.match(/data-slot="slider-thumb"/g)?.length, 1);
  }
});

test("range sliders retain one thumb per range endpoint", () => {
  const html = renderToStaticMarkup(createElement(Slider, { value: [20, 80] }));
  assert.equal(html.match(/data-slot="slider-thumb"/g)?.length, 2);
});

test("chart styles quote identifiers and render both theme colors", () => {
  const html = renderToStaticMarkup(
    createElement(ChartStyle, {
      id: "chart-report:one",
      config: {
        total: { theme: { light: "#346538", dark: "#edf3ec" } },
      },
    }),
  );
  assert.ok(html.includes('[data-chart="chart-report:one"]'));
  assert.ok(html.includes("--color-total: #346538"));
  assert.ok(html.includes("--color-total: #edf3ec"));
});

test("chart style content cannot close the style element during SSR", () => {
  const html = renderToStaticMarkup(
    createElement(ChartStyle, {
      id: "chart-report",
      config: { total: { color: "</style><script>alert(1)</script>" } },
    }),
  );
  assert.equal(html.match(/<\/style>/g)?.length, 1);
  assert.ok(!html.includes("</style><script>"));
});
