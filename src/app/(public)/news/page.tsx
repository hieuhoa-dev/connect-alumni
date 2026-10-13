import { Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedNews } from "@/actions/news-actions";
import { EmptyBlock } from "@/components/landing/landing-parts";
import { NewsCard } from "@/components/news/news-card";
import { LiveSearch } from "@/components/shared/live-search";
import { PublicPageTitle } from "@/components/shared/public-page-title";
import { Button } from "@/components/ui/button";
import {
  isNewsCategory,
  NEWS_CATEGORIES,
  NEWS_CATEGORY_LABEL,
} from "@/lib/text";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tin tức · DLU Alumni",
  description:
    "Thông báo, hoạt động kết nối, hợp tác và những câu chuyện thành công của cựu sinh viên Trường Đại học Đà Lạt.",
};

const PAGE_SIZE = 12;

interface NewsPageProps {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}

const buildHref = (params: {
  category?: string;
  search?: string;
  page?: number;
}) => {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const qs = query.toString();
  return qs ? `/news?${qs}` : "/news";
};

const NewsPage = async ({ searchParams }: NewsPageProps) => {
  const params = await searchParams;
  const category = isNewsCategory(params.category)
    ? params.category
    : undefined;
  const search = params.search?.trim() || undefined;
  const page = Math.max(Number.parseInt(params.page ?? "1", 10) || 1, 1);

  let result: Awaited<ReturnType<typeof getPublishedNews>> | null = null;
  try {
    result = await getPublishedNews({
      category,
      search,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });
  } catch (error) {
    console.error(
      "[news] Unable to load published news:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
  const { items, total } = result ?? { items: [], total: 0 };
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="container mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 pb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Bản tin cộng đồng DLU Alumni
        </span>
        <PublicPageTitle>Tin tức và hoạt động</PublicPageTitle>
      </header>

      <div className="flex flex-col gap-4 border-y border-border-strong py-4 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Chuyên mục" className="flex flex-wrap gap-1.5">
          {[undefined, ...NEWS_CATEGORIES].map((item) => {
            const active = item === category;
            return (
              <Link
                key={item ?? "all"}
                href={buildHref({ category: item, search })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border-strong text-muted-foreground hover:border-primary hover:text-primary",
                )}
              >
                {item ? NEWS_CATEGORY_LABEL[item] : "Tất cả"}
              </Link>
            );
          })}
        </nav>

        <LiveSearch
          initialValue={search}
          label="Tìm tin tức"
          placeholder="Tìm tiêu đề hoặc nội dung..."
          className="md:max-w-xs"
        />
      </div>

      <section aria-label="Danh sách tin" className="pt-8">
        {items.length === 0 ? (
          <EmptyBlock
            icon={Newspaper}
            title={result ? "Chưa có tin nào" : "Chưa thể tải bản tin"}
            description={
              !result
                ? "Vui lòng thử lại sau hoặc khám phá các câu chuyện trong Góc chia sẻ."
                : search || category
                  ? "Không tìm thấy tin phù hợp. Thử bỏ bộ lọc hoặc đổi từ khóa."
                  : "Thông báo và hoạt động của cộng đồng sẽ được cập nhật tại đây."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <nav
          aria-label="Phân trang"
          className="mt-12 flex items-center justify-between border-t border-border-strong pt-4"
        >
          {page > 1 ? (
            <Button
              render={
                <Link href={buildHref({ category, search, page: page - 1 })} />
              }
              nativeButton={false}
              variant="outline"
            >
              Trang trước
            </Button>
          ) : (
            <span />
          )}
          <span className="font-mono text-xs text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Button
              render={
                <Link href={buildHref({ category, search, page: page + 1 })} />
              }
              nativeButton={false}
              variant="outline"
            >
              Trang sau
            </Button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
};

export default NewsPage;
