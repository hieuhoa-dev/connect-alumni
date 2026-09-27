import Link from "next/link";
import { getFormsForFaculty } from "@/actions/form-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  FileText,
  Users,
  Calendar,
  ArrowRight,
  BarChart3,
  ExternalLink,
  Info,
  Layers,
  GraduationCap,
} from "lucide-react";
import { CopyFormLinkButton } from "./copy-form-link-button";

export const metadata = {
  title: "Quản lý Khảo sát & Biểu mẫu | Khoa CNTT",
};

const FacultyFormsPage = async () => {
  const formsList = await getFormsForFaculty();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            Đang mở
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
            Đã đóng
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            Bản nháp
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "survey":
        return (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            Khảo sát
          </span>
        );
      case "scholarship_app":
        return (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
            Học bổng
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            Biểu mẫu
          </span>
        );
    }
  };

  const getTargetRoleLabel = (role: string) => {
    switch (role) {
      case "student":
        return "Sinh viên";
      case "alumni":
        return "Cựu sinh viên";
      default:
        return "Tất cả";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Quản lý Khảo sát & Biểu mẫu
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Thiết kế biểu mẫu động, khảo sát việc làm cựu sinh viên, nhu cầu
            sinh viên và quản lý hồ sơ đăng ký học bổng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/faculty-admin/forms/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Tạo biểu mẫu mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Workflow Explanation Banner */}
      <Card className="border-primary/20 bg-primary/5 shadow-none">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5 shrink-0">
              <Info className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground text-sm">
                Luồng hiển thị & thu thập câu trả lời:
              </p>
              <p className="text-muted-foreground leading-relaxed">
                • <strong>Sinh viên / Cựu sinh viên</strong>: Khảo sát ở trạng
                thái <em>Đang mở</em> sẽ tự động hiển thị trong mục{" "}
                <strong>Biểu mẫu & Khảo sát</strong> (
                <code className="px-1 py-0.5 bg-background rounded text-primary border">
                  /student/surveys
                </code>
                ) và Bảng điều khiển của họ nếu đúng đối tượng áp dụng.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                • <strong>Khoa / Giáo vụ</strong>: Bạn có thể nhấn{" "}
                <strong>Làm thử / Xem trước</strong> để trải nghiệm giao diện
                người dùng điền biểu mẫu, hoặc dùng <strong>Chép link</strong>{" "}
                để gửi trực tiếp cho sinh viên.
              </p>
            </div>
          </div>
          <Link href="/student/surveys" target="_blank" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs bg-background"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Mở trang Khảo sát Sinh viên
            </Button>
          </Link>
        </CardContent>
      </Card>

      {formsList.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                Chưa có biểu mẫu nào
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tạo biểu mẫu đầu tiên để bắt đầu thu thập ý kiến đóng góp từ
                sinh viên và cựu sinh viên.
              </p>
            </div>
            <Link href="/faculty-admin/forms/new">
              <Button>Tạo biểu mẫu ngay</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formsList.map((form) => {
            const batchesText =
              form.targetBatches && form.targetBatches.length > 0
                ? `Khóa ${form.targetBatches.join(", ")}`
                : "Tất cả khóa";

            return (
              <Card
                key={form.id}
                className="flex flex-col justify-between hover:border-primary/50 transition-colors"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getTypeBadge(form.type)}
                        <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {getTargetRoleLabel(form.targetRole)}
                        </span>
                      </div>
                      {getStatusBadge(form.status)}
                    </div>
                    <CardTitle className="text-lg font-bold line-clamp-1">
                      {form.title}
                    </CardTitle>
                    {form.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {form.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-y border-border py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>
                          <strong>{form.responses.length}</strong> phản hồi
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span>
                          <strong>{form.questions.length}</strong> câu hỏi
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">{batchesText}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">
                          {form.deadline
                            ? new Date(form.deadline).toLocaleDateString(
                                "vi-VN",
                              )
                            : "Vô thời hạn"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="flex flex-col gap-2 pt-0 pb-4">
                  <div className="flex items-center gap-2 w-full">
                    <Link
                      href={`/student/surveys/${form.id}`}
                      target="_blank"
                      className="flex-1"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full flex items-center justify-center gap-1.5 text-xs h-8"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Làm thử / Xem trước
                      </Button>
                    </Link>
                    <CopyFormLinkButton formId={form.id} />
                  </div>

                  <Link
                    href={`/faculty-admin/forms/${form.id}/responses`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 text-xs h-8"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      Xem kết quả & Báo cáo
                      <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FacultyFormsPage;
