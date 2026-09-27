import * as React from "react";
import Link from "next/link";
import { getMyCompanies } from "@/actions/company-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Building2 } from "lucide-react";
import { NewJobForm } from "./job-form";
import { cn } from "@/lib/utils";

const NewJobPage = async () => {
  const companies = await getMyCompanies();
  const activeCompany =
    companies.find((c) => c.isActiveContext) || companies[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/employer/jobs"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 text-xs text-muted-foreground",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách tin tuyển dụng
        </Link>
      </div>

      {!activeCompany || !activeCompany.id ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">
          Bạn cần đăng ký và được Khoa xác minh hồ sơ công ty trước khi đăng
          tin.
        </Card>
      ) : activeCompany.verificationStatus !== "verified" ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">
          Hồ sơ công ty <strong>{activeCompany.name}</strong> hiện đang chờ Khoa
          xác minh. Chưa thể đăng tin tuyển dụng.
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Building2 className="h-4 w-4" />
              <span>Đăng tuyển cho: {activeCompany.name}</span>
            </div>
            <CardTitle className="text-xl font-bold">
              Tạo tin tuyển dụng mới
            </CardTitle>
            <CardDescription className="text-xs">
              Tin sau khi gửi sẽ ở trạng thái chờ duyệt (Pending) để Ban Chủ
              nhiệm Khoa kiểm duyệt nội dung trước khi xuất bản tới sinh viên.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewJobForm companyId={activeCompany.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewJobPage;
