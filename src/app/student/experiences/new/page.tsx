"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createExperiencePost } from "@/actions/experience-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Send, Sparkles } from "lucide-react";
import Link from "next/link";

const NewExperiencePage = () => {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [coverImageUrl, setCoverImageUrl] = React.useState("");
  const [tagsInput, setTagsInput] = React.useState("Kinh nghiệm, Phỏng vấn, Kỹ năng mềm");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      await createExperiencePost({
        title,
        content,
        coverImageUrl: coverImageUrl || null,
        tags,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/experiences");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi tạo bài viết.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/experiences"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "gap-1.5 text-xs text-muted-foreground",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại góc chia sẻ
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Dành cho Cựu sinh viên</span>
          </div>
          <CardTitle className="text-xl font-bold">Chia sẻ kinh nghiệm & Bài học thực tế</CardTitle>
          <CardDescription className="text-xs">
            Mọi bài viết sẽ được Ban Chủ nhiệm Khoa duyệt trước khi hiển thị công khai tới sinh viên nhằm đảm bảo tính định hướng và chất lượng thông tin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-4 text-center space-y-2">
              <AlertDescription className="font-semibold text-sm">
                🎉 Bài viết của bạn đã được gửi thành công!
              </AlertDescription>
              <p className="text-xs text-muted-foreground">
                Khoa sẽ duyệt và thông báo lại cho bạn sớm nhất. Đang chuyển hướng...
              </p>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2 text-xs">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium">Tiêu đề bài viết</Label>
                <Input
                  id="title"
                  placeholder="Ví dụ: Lộ trình từ thực tập sinh đến kỹ sư chính tại các tập đoàn công nghệ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={5}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags" className="text-xs font-medium">Từ khóa / Thẻ phân loại (cách nhau bằng dấu phẩy)</Label>
                <Input
                  id="tags"
                  placeholder="Kinh nghiệm, Phỏng vấn, Frontend, Cloud"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cover" className="text-xs font-medium">Đường dẫn ảnh bìa (tùy chọn)</Label>
                <Input
                  id="cover"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-xs font-medium">Nội dung chia sẻ chi tiết</Label>
                <Textarea
                  id="content"
                  rows={10}
                  placeholder="Chia sẻ về hành trình, bài học thất bại, lời khuyên thực tế dành cho các bạn khóa dưới..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  minLength={20}
                  disabled={isLoading}
                  className="text-sm leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isLoading} className="gap-2 font-medium">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang gửi bài...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Gửi bài viết chờ duyệt
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewExperiencePage;
