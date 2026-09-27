import * as React from "react";
import Link from "next/link";
import { getExperiencePostsForFaculty } from "@/actions/experience-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BookOpen, Clock, CheckCircle2, User } from "lucide-react";
import { ExperienceReviewActions } from "./experience-review-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RichTextContent } from "@/components/ui/rich-text-content";

const ExperiencesReviewPage = async () => {
  const posts = await getExperiencePostsForFaculty();

  const pendingList = posts.filter((p) => p.status === "pending");
  const publishedList = posts.filter((p) => p.status === "published");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Duyệt bài chia sẻ từ Cựu sinh viên
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Kiểm duyệt bài viết về kinh nghiệm thực tế, lộ trình nghề nghiệp và
          phỏng vấn trước khi xuất bản tới sinh viên
        </p>
      </div>

      {/* Pending posts */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          Bài viết chờ kiểm duyệt ({pendingList.length})
        </h2>

        {pendingList.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center bg-card border rounded-lg">
            Hiện không có bài viết nào đang chờ duyệt.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingList.map((post) => (
              <Card key={post.id} className="border-amber-500/30 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold">
                          {post.title}
                        </CardTitle>
                        <Badge className="bg-amber-600 text-white text-[10px]">
                          Chờ duyệt
                        </Badge>
                      </div>
                      <CardDescription className="text-xs flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>
                          Tác giả:{" "}
                          <strong>
                            {post.author?.profile?.fullName ||
                              post.author?.name}
                          </strong>
                        </span>
                        {post.author?.profile?.batchYear && (
                          <span>(Khóa {post.author?.profile?.batchYear})</span>
                        )}
                        <span>·</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </CardDescription>
                    </div>

                    <ExperienceReviewActions postId={post.id} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        #{t}
                      </Badge>
                    ))}
                  </div>
                  <div className="p-3 rounded bg-muted/40 border leading-relaxed text-foreground/90">
                    <RichTextContent
                      content={post.content}
                      className="text-xs space-y-2 [&_h2]:text-base [&_h2]:mt-3 [&_h3]:text-sm [&_h3]:mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Published posts */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Bài viết đã xuất bản ({publishedList.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {publishedList.map((post) => (
            <Card
              key={post.id}
              className="p-4 flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-sm text-foreground line-clamp-1">
                  {post.title}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Bởi {post.author?.profile?.fullName || post.author?.name} ·{" "}
                  {post.viewCount} lượt xem
                </span>
                <div className="pt-2 flex justify-end">
                  <Link
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                    )}
                    href={`/experiences/${post.id}`}
                  >
                    Xem bài viết →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperiencesReviewPage;
