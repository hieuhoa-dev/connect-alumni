import { getCompaniesForFaculty } from "@/actions/company-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Globe, Clock, ShieldCheck } from "lucide-react";
import { CompanyReviewActions } from "./company-review-actions";

const CompaniesReviewPage = async () => {
  const companies = await getCompaniesForFaculty();

  const pendingList = companies.filter(
    (c) => c.verificationStatus === "pending",
  );
  const verifiedList = companies.filter(
    (c) => c.verificationStatus === "verified",
  );
  const rejectedList = companies.filter(
    (c) => c.verificationStatus === "rejected",
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Xác minh Hồ sơ Doanh nghiệp Đối tác
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Kiểm duyệt thông tin doanh nghiệp trước khi cấp phép đăng tin tuyển
          dụng và kết nối cùng sinh viên
        </p>
      </div>

      {/* 1. Pending Queue */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          Hồ sơ chờ phê duyệt ({pendingList.length})
        </h2>

        {pendingList.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center bg-card border rounded-lg">
            Không có hồ sơ công ty nào đang chờ kiểm duyệt.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingList.map((company) => (
              <Card
                key={company.id}
                className="border-amber-500/30 bg-card shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold">
                          {company.name}
                        </CardTitle>
                        <Badge className="bg-amber-600 text-white text-[10px]">
                          Chờ xác minh
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        Lĩnh vực: <strong>{company.industry}</strong> · Người
                        đại diện:{" "}
                        <strong>
                          {company.creator?.profile?.fullName ||
                            company.creator?.name}
                        </strong>{" "}
                        ({company.creator?.email})
                      </CardDescription>
                    </div>

                    <CompanyReviewActions companyId={company.id} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p className="leading-relaxed">{company.description}</p>
                  {company.website && (
                    <div className="pt-1 flex items-center gap-1.5 text-[11px]">
                      <Globe className="h-3.5 w-3.5" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 2. Verified & Active Companies */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Doanh nghiệp đã xác minh ({verifiedList.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {verifiedList.map((company) => (
            <Card
              key={company.id}
              className="p-4 flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">
                    {company.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-emerald-600 border-emerald-500/30"
                  >
                    Verified
                  </Badge>
                </div>
                <p className="text-muted-foreground line-clamp-2">
                  {company.description}
                </p>
                <div className="text-[11px] text-muted-foreground pt-1">
                  Đã đăng:{" "}
                  <strong className="text-foreground">
                    {company.jobPosts.length}
                  </strong>{" "}
                  tin tuyển dụng
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompaniesReviewPage;
