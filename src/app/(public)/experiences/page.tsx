import { BookOpen, Calendar, Eye, Search, User } from "lucide-react";
import Link from "next/link";
import { getPublishedExperiencePosts } from "@/actions/experience-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ContentImage } from "@/components/shared/content-image";
import { stripHtml, truncateText } from "@/lib/utils";

interface ExperiencesPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

const ExperiencesPage = async ({ searchParams }: ExperiencesPageProps) => {
  const params = await searchParams;
  const posts = await getPublishedExperiencePosts({
    search: params.search,
    limit: 30,
  });

  const displayPosts = posts;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-pine-800">
            Góc chia sẻ kinh nghiệm — Cựu sinh viên Đại học Đà Lạt
          </h1>
          <p className="text-sm text-muted-foreground">
            Học hỏi bí quyết từ các thế hệ cựu sinh viên DLU: khởi nghiệp, kinh
            nghiệm làm việc, kỹ năng mềm và định hướng tương lai
          </p>
        </div>
        <Button
          render={<Link href="/student/experiences/new" />}
          nativeButton={false}
          size="sm"
        >
          Viết bài chia sẻ mới
        </Button>
      </div>

      {/* Search */}
      <form method="GET" className="max-w-md relative">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          name="search"
          placeholder="Tìm kiếm bài viết theo từ khóa..."
          defaultValue={params.search || ""}
          className="pl-9 text-xs"
        />
      </form>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayPosts.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card border border-dashed border-border/80 rounded-xl">
            <BookOpen className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-foreground">
              Không có bài viết phù hợp
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Thử tìm kiếm với từ khóa khác hoặc quay lại sau.
            </p>
          </div>
        ) : (
          displayPosts.map((post) => {
            const author = post.author?.profile;
            const plainContent = stripHtml(post.content || "");
            const snippet = truncateText(plainContent, 130);

            return (
              <Card
                key={post.id}
                className="flex flex-col justify-between overflow-hidden border border-border/80 hover:border-pine-400 dark:hover:border-pine-600 transition-all duration-300 shadow-xs hover:shadow-md group"
              >
                {/* Cover Image thumbnail */}
                <div
                  data-slot="card-image"
                  className="relative w-full h-44 overflow-hidden bg-muted"
                >
                  <ContentImage
                    file={post.coverImageUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <CardHeader className="pb-2.5">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {((post.tags as string[]) || [])
                      .slice(0, 3)
                      .map((t: string) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full border border-pine-200/70 bg-pine-50/80 dark:border-pine-900/60 dark:bg-pine-950/40 px-2 py-0.5 text-[10px] font-mono text-pine-800 dark:text-pine-300"
                        >
                          #{t}
                        </span>
                      ))}
                  </div>

                  <CardTitle className="text-base font-bold leading-snug line-clamp-2 group-hover:text-pine-700 dark:group-hover:text-pine-300 transition-colors">
                    <Link href={`/experiences/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {snippet}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                    <User className="size-3.5 text-pine-600 shrink-0" />
                    <span className="font-medium text-foreground truncate">
                      {author?.fullName || post.author?.name || "Cựu sinh viên DLU"}
                    </span>
                    {author?.batchYear && (
                      <span className="text-muted-foreground font-mono">
                        · K{author.batchYear}
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-0 text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/40 py-2.5 px-4 bg-muted/20">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>
                      {new Date(
                        post.publishedAt || post.createdAt,
                      ).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono">
                    <Eye className="size-3" />
                    <span>{post.viewCount || 0} lượt xem</span>
                  </div>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExperiencesPage;
