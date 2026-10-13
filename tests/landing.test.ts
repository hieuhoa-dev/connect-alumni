import assert from "node:assert/strict";
import test from "node:test";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
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

const renderLanding = (data: LandingData, search?: string) =>
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
          bfcacheId: "landing-ssr-test",
        },
      },
      createElement(LandingView, { data, search }),
    ),
  );

test("landing SSR keeps clear entry paths when no content is available", () => {
  const html = renderLanding(emptyData);
  assert.equal(html.match(/<h1(?:\s|>)/g)?.length, 1);
  assert.ok(html.includes("DLU Alumni"));
  assert.ok(html.includes('data-slot="landing-banner"'));
  assert.equal(html.match(/data-slot="carousel-item"/g)?.length, 2);
  assert.ok(html.includes("Khám phá lịch sự kiện"));
  assert.ok(html.includes("Ghé thăm bản tin"));
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
        excerpt: "Gặp gỡ sinh viên và cựu sinh viên toàn trường.",
        coverImageUrl: null,
        tags: ["Kết nối"],
        viewCount: 12,
        publishedAt: new Date("2026-10-12T02:00:00Z"),
        authorName: "Ban biên tập",
        authorBatch: null,
      },
    ],
    events: [
      {
        id: "event-one",
        title: "Gặp gỡ cựu sinh viên Đại học Đà Lạt",
        type: "talkshow",
        format: "offline",
        locationOrLink: "Giảng đường A25, Đại học Đà Lạt",
        startTime: new Date("2026-11-15T02:00:00Z"),
        endTime: new Date("2026-11-15T05:00:00Z"),
        capacity: 120,
        coverImageUrl: null,
        registrationCount: 30,
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
  const html = renderLanding(data);
  assert.ok(html.includes("Ngày hội kết nối các thế hệ"));
  assert.ok(html.includes('href="/news/news-one"'));
  assert.ok(html.includes('href="/events/event-one"'));
  assert.ok(html.includes("09:00, 15/11/2026"));
  assert.ok(html.includes("Thực tập phát triển phần mềm"));
  assert.ok(html.includes('href="/jobs/job-one"'));
  assert.ok(html.includes("120"));
});

test("landing search SSR shows results in place of the homepage and escapes keywords", () => {
  const html = renderLanding(emptyData, "<script>học bổng</script>");
  assert.equal(html.match(/<h1(?:\s|>)/g)?.length, 1);
  assert.match(
    html,
    /<h2[^>]*id="search-results-heading"[^>]*class="sr-only"[^>]*>Kết quả tìm kiếm<\/h2>/,
  );
  assert.ok(html.includes("Chưa tìm thấy bài phù hợp"));
  assert.equal(html.match(/Kết quả cho/g)?.length, 1);
  assert.match(
    html,
    /<output[^>]*data-slot="live-search-results"[^>]*>Kết quả cho “<span[^>]*>&lt;script&gt;học bổng&lt;\/script&gt;<\/span>”<\/output>/,
  );
  assert.ok(
    html.indexOf('data-slot="live-search-results"') <
      html.indexOf('id="search-results-heading"'),
  );
  assert.ok(!html.includes("Hiển thị tối đa 30"));
  assert.ok(!html.includes("Xem trong Tin tức"));
  assert.ok(!html.includes('data-slot="landing-banner"'));
  assert.ok(!html.includes("<script>học bổng</script>"));
  assert.ok(html.includes("&lt;script&gt;học bổng&lt;/script&gt;"));
  assert.ok(!html.includes('type="submit"'));
});
