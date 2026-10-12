import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsById, getRelatedNews } from "@/actions/news-actions";
import { SectionHeading, Tag } from "@/components/landing/landing-parts";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { formatDateVi, formatNumberVi, NEWS_CATEGORY_LABEL } from "@/lib/text";

interface NewsDetailPageProps {
  params: Promise<{ id: string }>;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NewsDetailPage = async ({ params }: NewsDetailPageProps) => {
  const { id } = await params;
  // Tránh lỗi truy vấn khi đường dẫn không phải UUID
  if (!UUID_RE.test(id)) notFound();

  const article = await getNewsById(id);
  if (!article) notFound();

  const related = await getRelatedNews(article.id, article.category);
  const authorName =
    article.author?.profile?.fullName || article.author?.name || "Ban biên tập";

  return (
    <div className="container mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <Button
        render={<Link href="/news" />}
        nativeButton={false}
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
      >
        <ArrowLeft data-icon="inline-start" />
        Tất cả tin tức
      </Button>

      <article className="flex flex-col gap-6 pt-6">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="blue">{NEWS_CATEGORY_LABEL[article.category]}</Tag>
            {article.status === "draft" && <Tag tone="yellow">Bản nháp</Tag>}
          </div>
          <h1 className="font-serif text-3xl font-normal leading-[1.15] tracking-tight text-foreground sm:text-5xl">
            {article.title}
          </h1>
          {article.summary && (
            <p className="text-lg leading-relaxed text-muted-foreground">
              {article.summary}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-border-strong py-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{authorName}</span>
            {article.publishedAt && (
              <time
                dateTime={new Date(article.publishedAt).toISOString()}
                className="font-mono"
              >
                {formatDateVi(article.publishedAt, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            )}
            <span className="flex items-center gap-1 font-mono">
              <Eye className="size-3" />
              {formatNumberVi(article.viewCount)}
            </span>
          </div>
        </header>

        {article.coverImageUrl && (
          // biome-ignore lint/performance/noImgElement: ảnh bìa do người dùng nhập, domain không cố định
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="aspect-[16/9] w-full rounded-xl border border-border-strong object-cover"
          />
        )}

        <RichTextContent content={article.content} />
      </article>

      {related.length > 0 && (
        <section
          aria-label="Tin liên quan"
          className="flex flex-col gap-6 pt-14"
        >
          <SectionHeading
            icon={Eye}
            eyebrow="Cùng chuyên mục"
            title="Tin liên quan"
            href={`/news?category=${article.category}`}
          />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {related.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default NewsDetailPage;
