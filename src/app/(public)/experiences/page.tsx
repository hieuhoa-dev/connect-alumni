import {
  BookOpen,
  Calendar,
  Eye,
  Search,
  User,
  ClipboardList,
  Sparkles,
  ExternalLink,
  Clock,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { getPublishedExperiencePosts } from "@/actions/experience-actions";
import { getPublicSurveys } from "@/actions/form-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    tab?: string;
  }>;
}

const ExperiencesPage = async ({ searchParams }: ExperiencesPageProps) => {
  const params = await searchParams;
  const activeTab = params.tab || "all";

  const [posts, surveys] = await Promise.all([
    getPublishedExperiencePosts({
      search: params.search,
      limit: 30,
    }),
    getPublicSurveys({ limit: 12 }),
  ]);

  const displayPosts = posts;
  const featuredSurvey = surveys.length > 0 ? surveys[0] : null;

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

      {/* Featured Survey Spotlight (nếu có khảo sát đang mở) */}
      {featuredSurvey && activeTab !== "surveys" && (
        <div className="relative overflow-hidden rounded-2xl border border-pine-200 dark:border-pine-800 bg-gradient-to-br from-pine-900 to-pine-950 text-white p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-800/80 border border-pine-700 px-2.5 py-0.5 text-xs font-semibold text-pine-200">
                  <Sparkles className="size-3 text-amber-400" />
                  Khảo sát tiêu điểm từ Khoa
                </span>
                {featuredSurvey.isGoogleForm && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/40 text-[11px]">
                    Google Form
                  </Badge>
                )}
                {featuredSurvey.deadline && (
                  <span className="text-xs text-pine-300/80 flex items-center gap-1 font-mono">
                    <Clock className="size-3" />
                    Hạn:{" "}
                    {new Date(featuredSurvey.deadline).toLocaleDateString(
                      "vi-VN",
                    )}
                  </span>
                )}
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                {featuredSurvey.title}
              </h2>

              <p className="text-xs sm:text-sm text-pine-100/80 line-clamp-2 leading-relaxed">
                {featuredSurvey.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                render={
                  <Link
                    href={
                      featuredSurvey.isGoogleForm &&
                      featuredSurvey.googleFormUrl
                        ? featuredSurvey.googleFormUrl
                        : `/student/surveys/${featuredSurvey.id}`
                    }
                    target={featuredSurvey.isGoogleForm ? "_blank" : undefined}
                    rel="noopener noreferrer"
                  />
                }
                nativeButton={false}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold shadow-xs"
              >
                <span>Tham gia khảo sát ngay</span>
                <ExternalLink data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Link
            href="/experiences"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab !== "surveys"
                ? "bg-pine-100 dark:bg-pine-900/60 text-pine-800 dark:text-pine-200"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bài viết chia sẻ ({displayPosts.length})
          </Link>
          <Link
            href="/experiences?tab=surveys"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "surveys"
                ? "bg-pine-100 dark:bg-pine-900/60 text-pine-800 dark:text-pine-200"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList className="size-3.5" />
            <span>Khảo sát & Ý kiến ({surveys.length})</span>
          </Link>
        </div>

        {activeTab !== "surveys" && (
          <form method="GET" className="max-w-xs w-full relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Tìm kiếm bài viết..."
              defaultValue={params.search || ""}
              className="pl-9 text-xs"
            />
          </form>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === "surveys" ? (
        /* Surveys Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-card border border-dashed border-border/80 rounded-xl">
              <ClipboardList className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-sm font-semibold text-foreground">
                Hiện chưa có đợt khảo sát nào đang mở
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Các khảo sát từ Khoa CNTT sẽ xuất hiện tại đây khi được phát động.
              </p>
            </div>
          ) : (
            surveys.map((s) => {
              const targetRoleLabel =
                s.targetRole === "alumni"
                  ? "Cựu sinh viên"
                  : s.targetRole === "student"
                    ? "Sinh viên"
                    : "Toàn bộ";

              const batchesText =
                s.targetBatches && s.targetBatches.length > 0
                  ? `Khóa ${s.targetBatches.join(", ")}`
                  : null;

              const destinationUrl =
                s.isGoogleForm && s.googleFormUrl
                  ? s.googleFormUrl
                  : `/student/surveys/${s.id}`;

              return (
                <Card
                  key={s.id}
                  className="flex flex-col justify-between border border-border/80 hover:border-pine-400 dark:hover:border-pine-600 transition-all shadow-xs hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {s.type}
                        </Badge>
                        {s.isGoogleForm && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-[10px]"
                          >
                            Google Form
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted">
                        {targetRoleLabel}
                      </span>
                    </div>

                    <CardTitle className="text-base font-bold leading-snug line-clamp-2">
                      <Link
                        href={destinationUrl}
                        target={s.isGoogleForm ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="hover:text-pine-700 dark:hover:text-pine-300 transition-colors"
                      >
                        {s.title}
                      </Link>
                    </CardTitle>

                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {s.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2 pb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="size-3.5" />
                      <span>
                        {s.deadline
                          ? `Hạn chót: ${new Date(s.deadline).toLocaleDateString("vi-VN")}`
                          : "Không giới hạn thời gian"}
                      </span>
                    </div>

                    {batchesText && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <GraduationCap className="size-3.5" />
                        <span>Áp dụng: {batchesText}</span>
                      </div>
                    )}

                    <div className="text-[11px]">
                      Đã có <strong>{s.responses.length}</strong> lượt phản hồi
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-border/40">
                    <Button
                      render={
                        <Link
                          href={destinationUrl}
                          target={s.isGoogleForm ? "_blank" : undefined}
                          rel="noopener noreferrer"
                        />
                      }
                      nativeButton={false}
                      size="sm"
                      className="w-full text-xs font-medium"
                    >
                      <span>Làm khảo sát</span>
                      {s.isGoogleForm ? (
                        <ExternalLink data-icon="inline-end" />
                      ) : (
                        <ArrowRight data-icon="inline-end" />
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        /* Posts Grid */
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
                        {author?.fullName ||
                          post.author?.name ||
                          "Cựu sinh viên DLU"}
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
      )}
    </div>
  );
};

export default ExperiencesPage;
