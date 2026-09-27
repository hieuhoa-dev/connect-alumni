"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEvent } from "@/actions/event-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, ArrowLeft, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const NewEventPage = () => {
  const router = useRouter();
  const [type, setType] = React.useState<
    "talkshow" | "workshop" | "job_fair" | "other"
  >("talkshow");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [format, setFormat] = React.useState<"online" | "offline">("offline");
  const [locationOrLink, setLocationOrLink] = React.useState(
    "Hội trường A, Tòa nhà Trung tâm",
  );
  const [coverImageUrl, setCoverImageUrl] = React.useState("");
  const [capacity, setCapacity] = React.useState("200");

  const [startTime, setStartTime] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [endTime, setEndTime] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(11, 30, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const ev = await createEvent({
        type,
        title,
        description,
        format,
        locationOrLink,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity: capacity ? Number(capacity) : null,
        coverImageUrl: coverImageUrl || null,
        status: "published",
      });

      router.push(`/faculty-admin/events/${ev.id}/speakers`);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi tạo sự kiện");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/faculty-admin/events"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 text-xs text-muted-foreground",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách sự kiện
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <Calendar className="h-4 w-4" />
            <span>Ban Chủ nhiệm Khoa</span>
          </div>
          <CardTitle className="text-xl font-bold">
            Tạo Sự kiện / Talkshow mới
          </CardTitle>
          <CardDescription className="text-xs">
            Sau khi tạo sự kiện, bạn có thể mời trực tiếp các Cựu sinh viên tiêu
            biểu tham gia làm diễn giả và người chia sẻ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2 text-xs">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-medium">
                Tiêu đề sự kiện
              </Label>
              <Input
                id="title"
                placeholder="Ví dụ: Talkshow Cựu Sinh Viên: Bí quyết chinh phục tuyển dụng Big Tech 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={5}
                disabled={isLoading}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs font-medium">
                  Loại sự kiện
                </Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="talkshow">Talkshow</option>
                  <option value="workshop">Workshop</option>
                  <option value="job_fair">Job Fair</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="format" className="text-xs font-medium">
                  Hình thức tổ chức
                </Label>
                <select
                  id="format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="offline">Trực tiếp (Offline)</option>
                  <option value="online">Trực tuyến (Online)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cap" className="text-xs font-medium">
                  Giới hạn số lượng (Người)
                </Label>
                <Input
                  id="cap"
                  type="number"
                  placeholder="200"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  disabled={isLoading}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start" className="text-xs font-medium">
                  Thời gian bắt đầu
                </Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="end" className="text-xs font-medium">
                  Thời gian kết thúc
                </Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="loc" className="text-xs font-medium">
                  Địa điểm hoặc Link phòng họp
                </Label>
                <Input
                  id="loc"
                  placeholder="Hội trường A hoặc https://meet.google.com/..."
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="img" className="text-xs font-medium">
                  Ảnh bìa sự kiện (URL)
                </Label>
                <Input
                  id="img"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  disabled={isLoading}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Nội dung chi tiết chương trình
              </Label>
              <RichTextEditor
                content={description}
                onChange={setDescription}
                placeholder="Mục đích buổi sự kiện, các chủ đề chia sẻ, thời lượng từng phần, diễn giả dự kiến..."
                disabled={isLoading}
                minHeight="220px"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo sự kiện...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Tạo sự kiện & Chuyển sang mời diễn giả
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewEventPage;
