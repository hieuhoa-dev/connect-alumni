import { Newspaper, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedNews } from "@/actions/news-actions";
import { EmptyBlock } from "@/components/landing/landing-parts";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isNewsCategory,
  NEWS_CATEGORIES,
  NEWS_CATEGORY_LABEL,
} from "@/lib/text";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tin tức - Cựu sinh viên Khoa CNTT",
  description:
    "Thông báo, hoạt động kết nối, hợp tác và những câu chuyện thành công của cựu sinh viên Khoa Công nghệ Thông tin.",
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

  const { items, total } = await getPublishedNews({
    category,
    search,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="container mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 pb-8">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Bản tin Khoa Công nghệ Thông tin
        </span>
        <h1 className="font-serif text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          Tin tức{" "}
          <span className="font-light italic text-foreground/80">
            và hoạt động
          </span>
        </h1>
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
                    ? "border-foreground bg-foreground text-background"
                    : "border-border-strong text-muted-foreground hover:text-foreground",
                )}
              >
                {item ? NEWS_CATEGORY_LABEL[item] : "Tất cả"}
              </Link>
            );
          })}
        </nav>

        <form action="/news" method="get" className="flex gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          <Input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Tìm theo tiêu đề"
            aria-label="Tìm tin tức"
            className="w-full md:w-64"
          />
          <Button type="submit" variant="outline">
            <Search data-icon="inline-start" />
            Tìm
          </Button>
        </form>
      </div>

      <section aria-label="Danh sách tin" className="pt-8">
        {items.length === 0 ? (
          <EmptyBlock
            icon={Newspaper}
            title="Chưa có tin nào"
            description={
              search || category
                ? "Không tìm thấy tin phù hợp. Thử bỏ bộ lọc hoặc đổi từ khóa."
                : "Khoa sẽ đăng thông báo và hoạt động tại đây."
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
