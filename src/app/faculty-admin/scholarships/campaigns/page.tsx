import Link from "next/link";
import { getAllCampaignsForFaculty } from "@/actions/scholarship-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PlusCircle,
  Award,
  Users,
  DollarSign,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { PledgeActions } from "./pledge-actions";

export const metadata = {
  title: "Quản lý Chiến dịch Học bổng & Đóng góp | Khoa CNTT",
};

const CampaignsManagementPage = async () => {
  const campaigns = await getAllCampaignsForFaculty();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Quản lý Chiến dịch Học bổng & Quỹ Tài trợ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi tiến độ gây quỹ, xác nhận cam kết đóng góp từ doanh
            nghiệp/cựu sinh viên và điều phối xét học bổng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/faculty-admin/scholarships/applications/review">
            <Button variant="outline" className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Duyệt hồ sơ xin học bổng
            </Button>
          </Link>
          <Link href="/faculty-admin/scholarships/campaigns/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Tạo chiến dịch mới
            </Button>
          </Link>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                Chưa có chiến dịch nào
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tạo chiến dịch học bổng đầu tiên để bắt đầu kết nối các nguồn
                tài trợ tới sinh viên.
              </p>
            </div>
            <Link href="/faculty-admin/scholarships/campaigns/new">
              <Button>Tạo chiến dịch ngay</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {campaigns.map((camp) => {
            const current = Number(camp.currentAmount);
            const target = Number(camp.targetAmount);
            const percent =
              target > 0
                ? Math.min(100, Math.round((current / target) * 100))
                : 0;
            const pendingPledges = camp.pledges.filter(
              (p) => p.status === "pledged",
            );

            return (
              <Card key={camp.id} className="overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-bold font-serif">
                          {camp.title}
                        </CardTitle>
                        <Badge
                          variant={
                            camp.status === "open" ? "default" : "outline"
                          }
                          className="capitalize"
                        >
                          {camp.status === "open" ? "Đang mở" : camp.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-1 mt-1">
                        {camp.description}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/scholarships/${camp.id}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground"
                        >
                          Xem công khai
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Progress & Target numbers */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Đã thực nhận (Tiền về quỹ)
                      </span>
                      <div className="text-xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
                        {current.toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Mục tiêu chiến dịch
                      </span>
                      <div className="text-xl font-bold font-serif">
                        {target.toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Tổng số lượt đóng góp
                      </span>
                      <div className="text-xl font-bold font-serif">
                        {camp.pledges.length} lượt ({pendingPledges.length} chờ
                        duyệt)
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Số hồ sơ sinh viên nộp
                      </span>
                      <div className="text-xl font-bold font-serif text-primary">
                        {camp.applications.length} hồ sơ
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Tiến độ huy động quỹ</span>
                      <span>{percent}%</span>
                    </div>
                    <Progress value={percent} className="h-2.5" />
                  </div>

                  {/* Pledges Management List for this campaign */}
                  {camp.pledges.length > 0 && (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                        <span>
                          Danh sách đóng góp & tài trợ ({camp.pledges.length})
                        </span>
                        {pendingPledges.length > 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            Cần xác nhận {pendingPledges.length} khoản
                          </span>
                        )}
                      </div>
                      <div className="divide-y divide-border">
                        {camp.pledges.map((p) => (
                          <div
                            key={p.id}
                            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold flex items-center gap-2">
                                <span>
                                  {p.isAnonymous
                                    ? "Ẩn danh (Nhà hảo tâm)"
                                    : p.donorDisplayName}
                                </span>
                                {p.status === "fulfilled" && (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0">
                                    Đã nhận
                                  </Badge>
                                )}
                                {p.status === "pledged" && (
                                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] py-0">
                                    Đang cam kết
                                  </Badge>
                                )}
                                {p.status === "cancelled" && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 text-muted-foreground"
                                  >
                                    Đã hủy
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(p.createdAt).toLocaleDateString(
                                  "vi-VN",
                                )}{" "}
                                • {p.note || "Không có lời nhắn"}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-serif font-bold text-base text-foreground">
                                {Number(p.amount).toLocaleString("vi-VN")} đ
                              </span>
                              <PledgeActions
                                pledgeId={p.id}
                                status={p.status}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignsManagementPage;
