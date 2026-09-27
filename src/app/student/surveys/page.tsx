import * as React from "react";
import Link from "next/link";
import { getAvailableFormsForUser } from "@/actions/form-actions";
import { getCurrentUser } from "@/lib/permissions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

const SurveysPage = async () => {
  const [forms, current] = await Promise.all([
    getAvailableFormsForUser(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Biểu mẫu khảo sát & Đóng góp ý kiến
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Các khảo sát tình hình việc làm, chất lượng đào tạo và đóng góp ý kiến
          được thiết kế riêng cho khóa của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center text-xs text-muted-foreground space-y-2">
              <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-2" />
              <p className="font-semibold text-foreground text-sm">
                Hiện không có biểu mẫu khảo sát nào
              </p>
              <p>
                Mọi khảo sát mới từ Khoa sẽ tự động hiển thị tại đây khi được
                mở.
              </p>
            </CardContent>
          </Card>
        ) : (
          forms.map((f) => {
            const hasSubmitted = f.responses.length > 0;
            const isDeadlinePassed = f.deadline
              ? new Date(f.deadline) < new Date()
              : false;

            return (
              <Card
                key={f.id}
                className="flex flex-col justify-between shadow-sm hover:border-primary/40 transition"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {f.type}
                    </Badge>
                    {hasSubmitted ? (
                      <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã hoàn thành
                      </Badge>
                    ) : isDeadlinePassed ? (
                      <Badge variant="destructive" className="text-[10px]">
                        Đã hết hạn
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Chưa trả lời
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold leading-snug">
                    <Link href={`/student/surveys/${f.id}`}>{f.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {f.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2 pb-3">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {f.deadline
                        ? `Hạn chót: ${new Date(f.deadline).toLocaleDateString("vi-VN")}`
                        : "Không giới hạn thời hạn"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Số câu hỏi:{" "}
                    <strong className="text-foreground">
                      {f.questions.length}
                    </strong>{" "}
                    câu
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/40 flex justify-end">
                  <Link
                    href={`/student/surveys/${f.id}`}
                    className={buttonVariants({
                      size: "sm",
                      variant: hasSubmitted ? "outline" : "default",
                      className:
                        isDeadlinePassed && !hasSubmitted
                          ? "pointer-events-none opacity-50"
                          : "",
                    })}
                  >
                    {hasSubmitted ? "Xem lại câu trả lời" : "Làm khảo sát ngay"}
                  </Link>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SurveysPage;
