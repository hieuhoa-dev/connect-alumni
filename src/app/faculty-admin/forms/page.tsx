import Link from "next/link";
import { getFormsForFaculty } from "@/actions/form-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, Users, Calendar, ArrowRight, BarChart3 } from "lucide-react";

export const metadata = {
  title: "Quản lý Khảo sát & Biểu mẫu | Khoa CNTT",
};

const FacultyFormsPage = async () => {
  const formsList = await getFormsForFaculty();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Đang mở</Badge>;
      case "closed":
        return <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">Đã đóng</Badge>;
      case "draft":
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Bản nháp</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "survey":
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">Khảo sát</span>;
      case "scholarship_app":
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">Học bổng</span>;
      default:
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Biểu mẫu</span>;
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
            Tạo và theo dõi các biểu mẫu khảo sát việc làm cựu sinh viên, nhu cầu sinh viên và hồ sơ học bổng.
          </p>
        </div>
        <Link href="/faculty-admin/forms/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Tạo biểu mẫu mới
          </Button>
        </Link>
      </div>

      {formsList.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Chưa có biểu mẫu nào</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tạo biểu mẫu đầu tiên để bắt đầu thu thập ý kiến đóng góp từ sinh viên và cựu sinh viên.
              </p>
            </div>
            <Link href="/faculty-admin/forms/new">
              <Button>Tạo biểu mẫu ngay</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formsList.map((form) => (
            <Card key={form.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  {getTypeBadge(form.type)}
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
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-y border-border py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span><strong>{form.responses.length}</strong> phản hồi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span><strong>{form.questions.length}</strong> câu hỏi</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      Hạn: {form.deadline ? new Date(form.deadline).toLocaleDateString("vi-VN") : "Không thời hạn"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link href={`/faculty-admin/forms/${form.id}/responses`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Xem kết quả & Báo cáo
                      <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyFormsPage;
