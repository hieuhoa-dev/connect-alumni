import Link from "next/link";
import { getPublishedExperiencePosts } from "@/actions/experience-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Search, Eye, Calendar, User } from "lucide-react";

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

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
            Góc chia sẻ kinh nghiệm Cựu sinh viên
          </h1>
          <p className="text-sm text-muted-foreground">
            Học hỏi bí quyết từ các thế hệ cựu sinh viên: kinh nghiệm phỏng vấn, thực tập, kỹ năng mềm và định hướng nghề nghiệp
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
        {posts.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card border border-dashed border-border/80 rounded-xl">
            <BookOpen className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-foreground">Không có bài viết phù hợp</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Thử tìm kiếm với từ khóa khác hoặc quay lại sau.
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const author = post.author?.profile;
            return (
              <Card key={post.id} className="flex flex-col justify-between border border-border/80 hover:border-foreground/20 transition-colors shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <CardTitle className="text-base font-semibold leading-snug line-clamp-2">
                    <Link href={`/experiences/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-[11px] pt-1 flex items-center gap-1.5 font-mono">
                    <User className="size-3" />
                    <span>{author?.fullName || post.author?.name || "Tác giả"}</span>
                    {author?.batchYear && (
                      <span className="text-muted-foreground">· K{author.batchYear % 100}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground line-clamp-3 pb-3 leading-relaxed">
                  {post.content}
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" />
                      {post.viewCount}
                    </span>
                  </span>
                  <Button
                    render={<Link href={`/experiences/${post.id}`} />}
                    nativeButton={false}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-medium"
                  >
                    Đọc tiếp
                  </Button>
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
