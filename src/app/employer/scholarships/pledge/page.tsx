import * as React from "react";
import Link from "next/link";
import { getScholarshipCampaigns } from "@/actions/scholarship-actions";
import { getCurrentUser } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, HeartHandshake, ShieldCheck } from "lucide-react";
import { PledgeForm } from "./pledge-form";

const PledgePage = async () => {
  const [campaigns, current] = await Promise.all([
    getScholarshipCampaigns(),
    getCurrentUser(),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/employer/dashboard" />}
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Dashboard
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <HeartHandshake className="h-4 w-4" />
            <span>Đồng hành cùng Quỹ Khuyến học</span>
          </div>
          <CardTitle className="text-xl font-bold">
            Cam kết tài trợ Quỹ Khuyến học
          </CardTitle>
          <CardDescription className="text-xs">
            Hệ thống ghi nhận danh dự cam kết tài trợ (Pledge). Tiền thật được
            chuyển trực tiếp qua tài khoản ngân hàng của Nhà trường/Khoa ngoài
            hệ thống. Khoa sẽ xác nhận trạng thái Đã nhận tiền sau khi đối soát.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              Hiện chưa có chiến dịch học bổng nào đang mở nhận tài trợ.
            </p>
          ) : (
            <PledgeForm
              campaigns={campaigns}
              defaultName={
                current?.profile?.fullName || current?.user.name || ""
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PledgePage;
