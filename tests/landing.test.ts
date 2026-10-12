import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingView } from "../src/components/landing/landing-view";
import type { LandingData } from "../src/lib/public-data";

const emptyData: LandingData = {
  posts: [],
  popular: [],
  events: [],
  jobs: [],
  campaign: null,
  partners: [],
  stats: { alumni: 0, partners: 0, events: 0, fundReceived: 0 },
};

test("landing SSR keeps clear entry paths when no content is available", () => {
  const html = renderToStaticMarkup(
    createElement(LandingView, { data: emptyData }),
  );
  assert.equal(html.match(/<h1(?:\s|>)/g)?.length, 1);
  assert.ok(html.includes("Tham gia mạng lưới"));
  for (const role of ["student", "alumni", "employer"]) {
    assert.ok(html.includes(`href="/register?role=${role}"`));
  }
  for (const route of ["/news", "/events", "/jobs", "/scholarships"]) {
    assert.ok(html.includes(`href="${route}"`));
  }
  assert.ok(html.includes("Chưa có tin tuyển dụng đang mở"));
  assert.ok(
    !html.includes('data-revealed="false"'),
    "server content is visible before hydration",
  );
});

test("landing SSR renders supplied community data and its detail links", () => {
  const data: LandingData = {
    ...emptyData,
    posts: [
      {
        id: "news-one",
        href: "/news/news-one",
        kind: "news",
        isPinned: true,
        title: "Ngày hội kết nối các thế hệ",
        excerpt: "Gặp gỡ cộng đồng Khoa CNTT.",
        coverImageUrl: null,
        tags: ["Kết nối"],
        viewCount: 12,
        publishedAt: new Date("2026-10-12T02:00:00Z"),
        authorName: "Ban biên tập",
        authorBatch: null,
      },
    ],
    jobs: [
      {
        id: "job-one",
        title: "Thực tập phát triển phần mềm",
        location: "Hồ Chí Minh",
        jobType: "internship",
        salaryRange: null,
        expiresAt: new Date("2026-12-01T00:00:00Z"),
        companyName: "Công ty phần mềm Việt",
        companyLogoUrl: null,
      },
    ],
    stats: { alumni: 120, partners: 8, events: 15, fundReceived: 40_000_000 },
  };
  const html = renderToStaticMarkup(createElement(LandingView, { data }));
  assert.ok(html.includes("Ngày hội kết nối các thế hệ"));
  assert.ok(html.includes('href="/news/news-one"'));
  assert.ok(html.includes("Thực tập phát triển phần mềm"));
  assert.ok(html.includes('href="/jobs/job-one"'));
  assert.ok(html.includes("120"));
});
