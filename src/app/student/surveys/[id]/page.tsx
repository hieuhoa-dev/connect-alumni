import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormById } from "@/actions/form-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/permissions";
import { SurveyFormRenderer } from "./form-renderer";

interface SurveyDetailPageProps {
  params: Promise<{ id: string }>;
}

const SurveyDetailPage = async ({ params }: SurveyDetailPageProps) => {
  const { id } = await params;
  const [form, current] = await Promise.all([
    getFormById(id),
    getCurrentUser(),
  ]);

  if (!form) {
    notFound();
  }

  const isExpired =
    form.status !== "open" ||
    (form.deadline ? new Date(form.deadline) < new Date() : false);
  const response = form.responses[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/student/surveys"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "gap-1.5 text-xs text-muted-foreground",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách khảo sát
        </Link>
      </div>

      <Card className="shadow-sm border-primary/20">
        <CardHeader className="space-y-2 border-b border-border/60 pb-4">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className="text-xs uppercase font-semibold"
            >
              {form.type}
            </Badge>
            {form.deadline && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Hạn chót: {new Date(form.deadline).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {form.title}
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            {form.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {response ? (
            <div className="flex flex-col gap-5">
              <p className="text-sm text-muted-foreground">
                Bạn đã gửi biểu mẫu. Câu trả lời đã được ghi nhận dưới đây.
              </p>
              {form.questions.map((question) => {
                const answer = response.answers.find(
                  (item) => item.questionId === question.id,
                );
                const value = answer?.answerValue;
                return (
                  <div key={question.id} className="flex flex-col gap-2">
                    <p className="text-sm font-medium">{question.label}</p>
                    {answer?.fileUrl && /^https?:\/\//i.test(answer.fileUrl) ? (
                      <a
                        href={answer.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline"
                      >
                        Xem tài liệu đính kèm
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {Array.isArray(value)
                          ? value.join(", ") || "Không có câu trả lời"
                          : value != null && value !== ""
                            ? String(value)
                            : "Không có câu trả lời"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <SurveyFormRenderer
              form={form}
              isExpired={isExpired}
              previewOnly={
                form.status !== "open" &&
                (current?.role === "faculty_staff" || current?.role === "admin")
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyDetailPage;
