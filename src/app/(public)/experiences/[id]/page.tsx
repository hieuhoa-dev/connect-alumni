import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExperiencePostById } from "@/actions/experience-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import { RichTextContent } from "@/components/ui/rich-text-content";

interface ExperienceDetailPageProps {
  params: Promise<{ id: string }>;
}

const ExperienceDetailPage = async ({ params }: ExperienceDetailPageProps) => {
  const { id } = await params;
  const post = await getExperiencePostById(id);

  if (!post) {
    notFound();
  }

  const author = post.author?.profile;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Button
          render={<Link href="/experiences" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <ArrowLeft data-icon="inline-start" />
          Quay lại góc chia sẻ
        </Button>
      </div>

      <article className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                #{t}
              </span>
            ))}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-foreground leading-[1.15]">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-b border-border/70 pb-4 font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Xuất bản:{" "}
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
                "vi-VN",
                { dateStyle: "long" },
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {post.viewCount} lượt xem
            </span>
          </div>
        </div>

        {/* Cover image if available */}
        {post.coverImageUrl && (
          <div className="rounded-xl overflow-hidden max-h-96 w-full bg-muted border border-border/80">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Author box */}
        <Card className="bg-card border border-border/80">
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="size-12 border border-border/70">
              <AvatarImage src={author?.avatarUrl || undefined} />
              <AvatarFallback className="bg-foreground text-background font-bold text-xs">
                {author?.fullName?.slice(0, 2).toUpperCase() || "AL"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 text-xs">
              <div className="font-semibold text-foreground text-sm">
                {author?.fullName || post.author?.name || "Tác giả"}
              </div>
              <div className="text-muted-foreground font-mono text-[11px]">
                {author?.batchYear
                  ? `Cựu sinh viên Khóa ${author.batchYear}`
                  : "Cựu sinh viên"}
                {author?.bio && ` · ${author.bio}`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Body content */}
        <div className="pt-2 border-t border-border/60">
          <RichTextContent content={post.content} />
        </div>
      </article>
    </div>
  );
};

export default ExperienceDetailPage;
