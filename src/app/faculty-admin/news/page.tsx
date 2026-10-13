import { Newspaper, PlusCircle } from "lucide-react";
import Link from "next/link";
import { getNewsForStaff } from "@/actions/news-actions";
import { EmptyBlock, Tag } from "@/components/landing/landing-parts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateVi, formatNumberVi, NEWS_CATEGORY_LABEL } from "@/lib/text";
import { NewsRowActions } from "./news-row-actions";

const FacultyNewsPage = async () => {
  const articles = await getNewsForStaff();
  const publishedCount = articles.filter(
    (a) => a.status === "published",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
            Quản lý tin tức
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {articles.length} bài, {publishedCount} bài đang hiển thị công khai.
          </p>
        </div>
        <Button
          render={<Link href="/faculty-admin/news/new" />}
          nativeButton={false}
        >
          <PlusCircle data-icon="inline-start" />
          Viết tin mới
        </Button>
      </div>

      {articles.length === 0 ? (
        <EmptyBlock
          icon={Newspaper}
          title="Chưa có bài tin tức nào"
          description="Bấm Viết tin mới để đăng thông báo đầu tiên của cộng đồng."
        />
      ) : (
        <div className="rounded-xl border border-border-strong">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Chuyên mục</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Lượt xem</TableHead>
                <TableHead>Ngày đăng</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="max-w-sm">
                    <div className="flex flex-col gap-0.5">
                      <span className="line-clamp-2 font-medium text-foreground">
                        {article.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {article.author?.profile?.fullName ||
                          article.author?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tag>{NEWS_CATEGORY_LABEL[article.category]}</Tag>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Tag
                        tone={
                          article.status === "published" ? "green" : "yellow"
                        }
                      >
                        {article.status === "published" ? "Đã đăng" : "Nháp"}
                      </Tag>
                      {article.isPinned && <Tag tone="blue">Ghim</Tag>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumberVi(article.viewCount)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {article.publishedAt
                      ? formatDateVi(article.publishedAt)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <NewsRowActions
                      id={article.id}
                      title={article.title}
                      status={article.status}
                      isPinned={article.isPinned}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default FacultyNewsPage;
