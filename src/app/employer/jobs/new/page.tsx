import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { getMyCompanies } from "@/actions/company-actions";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NewJobForm } from "./job-form";

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
          Bạn cần đăng ký và được Ban quản trị xác minh hồ sơ công ty trước khi
          đăng tin.
        </Card>
      ) : activeCompany.verificationStatus !== "verified" ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">
          <p>
            Hồ sơ công ty <strong>{activeCompany.name}</strong>{" "}
            {activeCompany.verificationStatus === "rejected"
              ? "đã bị từ chối xác minh."
              : "đang chờ Ban quản trị xác minh."}{" "}
            Chưa thể đăng tin tuyển dụng.
          </p>
          {activeCompany.verificationStatus === "rejected" &&
            activeCompany.rejectedReason && (
              <p>Lý do: {activeCompany.rejectedReason}</p>
            )}
          <Link
            href="/employer/dashboard"
            className="underline underline-offset-4"
          >
            Xem hồ sơ doanh nghiệp
          </Link>
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
              Tin sau khi gửi sẽ ở trạng thái chờ duyệt để Ban quản trị kiểm tra
              nội dung trước khi xuất bản tới cộng đồng.
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
