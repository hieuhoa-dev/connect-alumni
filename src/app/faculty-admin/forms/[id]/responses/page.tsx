import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormResponsesAndAnalytics } from "@/actions/form-actions";
import { Button } from "@/components/ui/button";
import { ResponseAnalytics } from "./response-analytics";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Báo cáo Kết quả Khảo sát | Khoa CNTT",
};

const FormResponsesPage = async ({ params }: PageProps) => {
  const { id } = await params;
  let data: Awaited<ReturnType<typeof getFormResponsesAndAnalytics>>;
  try {
    data = await getFormResponsesAndAnalytics(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              render={<Link href="/faculty-admin/forms" />}
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1 text-muted-foreground"
            >
              <ArrowLeft data-icon="inline-start" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
              {data.form.title}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground pl-2">
            {data.form.description ||
              "Báo cáo phân tích dữ liệu và danh sách câu trả lời chi tiết"}
          </p>
        </div>

        <Button
          render={
            <Link
              href={`/student/surveys/${data.form.id}`}
              target="_blank"
              rel="noreferrer"
            />
          }
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ExternalLink data-icon="inline-start" />
          Xem trang khảo sát công khai
        </Button>
      </div>

      <ResponseAnalytics data={data} />
    </div>
  );
};

export default FormResponsesPage;
