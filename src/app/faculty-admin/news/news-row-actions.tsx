"use client";

import { Eye, EyeOff, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  deleteNews,
  setNewsPinned,
  setNewsStatus,
} from "@/actions/news-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export const NewsRowActions = ({
  id,
  title,
  status,
  isPinned,
}: {
  id: string;
  title: string;
  status: "draft" | "published";
  isPinned: boolean;
}) => {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const run = async (task: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await task();
      toast.add({ type: "success", description: success });
      router.refresh();
    } catch (err) {
      toast.add({
        type: "error",
        description: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        render={<Link href={`/faculty-admin/news/${id}/edit`} />}
        nativeButton={false}
        variant="ghost"
        size="icon-sm"
        aria-label="Chỉnh sửa"
      >
        <Pencil />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        disabled={busy || status !== "published"}
        aria-label={isPinned ? "Bỏ ghim" : "Ghim lên trang chủ"}
        title={status !== "published" ? "Chỉ ghim được tin đã đăng" : undefined}
        onClick={() =>
          run(
            () => setNewsPinned(id, !isPinned),
            isPinned ? "Đã bỏ ghim" : "Đã ghim lên trang chủ",
          )
        }
      >
        {isPinned ? <PinOff /> : <Pin />}
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        disabled={busy}
        aria-label={status === "published" ? "Gỡ xuống" : "Đăng bài"}
        onClick={() =>
          run(
            () =>
              setNewsStatus(id, status === "published" ? "draft" : "published"),
            status === "published" ? "Đã gỡ bài xuống" : "Đã đăng bài",
          )
        }
      >
        {status === "published" ? <EyeOff /> : <Eye />}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Xóa"
              className="text-destructive"
              disabled={busy}
            />
          }
        >
          <Trash2 />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết này?</AlertDialogTitle>
            <AlertDialogDescription>
              Bài "{title}" sẽ bị xóa vĩnh viễn và không thể khôi phục. Nếu chỉ
              muốn ẩn khỏi trang công khai, hãy chọn gỡ xuống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => run(() => deleteNews(id), "Đã xóa bài viết")}
            >
              Xóa bài
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
