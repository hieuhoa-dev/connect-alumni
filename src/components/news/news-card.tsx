import { Newspaper } from "lucide-react";
import Link from "next/link";
import { CoverImage, Tag } from "@/components/landing/landing-parts";
import {
  formatDateVi,
  NEWS_CATEGORY_LABEL,
  type NewsCategory,
} from "@/lib/text";
import { cn } from "@/lib/utils";

export interface NewsCardItem {
  id: string;
  title: string;
  summary?: string | null;
  coverImageUrl: string | null;
  category: NewsCategory;
  publishedAt: Date | null;
  isPinned?: boolean;
}

export const NewsCard = ({
  item,
  className,
}: {
  item: NewsCardItem;
  className?: string;
}) => {
  return (
    <article className={cn("group relative flex flex-col gap-3", className)}>
      <CoverImage
        src={item.coverImageUrl}
        alt={item.title}
        icon={Newspaper}
        className="aspect-[16/10]"
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Tag tone={item.isPinned ? "yellow" : "blue"}>
            {NEWS_CATEGORY_LABEL[item.category]}
          </Tag>
          {item.isPinned && <Tag tone="yellow">Ghim</Tag>}
        </div>
        <h3 className="font-serif text-xl font-medium leading-snug tracking-tight text-foreground">
          <Link
            href={`/news/${item.id}`}
            className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
          >
            {item.title}
          </Link>
        </h3>
        {item.summary && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
        )}
        {item.publishedAt && (
          <time
            dateTime={new Date(item.publishedAt).toISOString()}
            className="font-mono text-xs text-muted-foreground"
          >
            {formatDateVi(item.publishedAt)}
          </time>
        )}
      </div>
    </article>
  );
};
