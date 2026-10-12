import { notFound } from "next/navigation";
import { getNewsByIdForStaff } from "@/actions/news-actions";
import { NewsForm } from "@/components/news/news-form";

interface EditNewsPageProps {
  params: Promise<{ id: string }>;
}

const EditNewsPage = async ({ params }: EditNewsPageProps) => {
  const { id } = await params;
  const article = await getNewsByIdForStaff(id);
  if (!article) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
          Chỉnh sửa tin
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ngày đăng ban đầu được giữ nguyên khi bạn sửa nội dung.
        </p>
      </div>
      <NewsForm
        newsId={article.id}
        initial={{
          title: article.title,
          summary: article.summary ?? "",
          content: article.content,
          category: article.category,
          coverImageUrl: article.coverImageUrl ?? "",
          isPinned: article.isPinned,
          status: article.status,
        }}
      />
    </div>
  );
};

export default EditNewsPage;
