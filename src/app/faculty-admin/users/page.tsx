import { adminGetUsers } from "@/actions/auth-actions";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldAlert, CheckCircle, Ban } from "lucide-react";
import { UserRowActions } from "./user-row-actions";

export const metadata = {
  title: "Quản lý Người dùng Hệ thống | Quản trị viên Khoa",
};

const AdminUsersPage = async () => {
  // Hard security guard Layer 2
  const current = await requireRole("admin");
  const usersList = await adminGetUsers();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
            Admin
          </Badge>
        );
      case "faculty_staff":
        return (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
            Giáo vụ Khoa
          </Badge>
        );
      case "employer":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            Doanh nghiệp
          </Badge>
        );
      case "alumni":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
            Cựu sinh viên
          </Badge>
        );
      case "student":
      default:
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            Sinh viên
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Quản trị Người dùng & Phân quyền
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Khu vực bảo mật cấp cao: Phân quyền vai trò hệ thống, khóa/mở khóa tài
          khoản người dùng theo chính sách Khoa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Tổng số tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">
              {usersList.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Sinh viên & Cựu SV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">
              {
                usersList.filter(
                  (u) =>
                    u.profile?.role === "student" ||
                    u.profile?.role === "alumni",
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Đại diện Doanh nghiệp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">
              {usersList.filter((u) => u.profile?.role === "employer").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Cán bộ / Giáo vụ Khoa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">
              {
                usersList.filter(
                  (u) =>
                    u.profile?.role === "faculty_staff" ||
                    u.profile?.role === "admin",
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif">
            Danh sách tất cả người dùng
          </CardTitle>
          <CardDescription>
            Cập nhật vai trò hoặc kiểm soát truy cập trực tiếp vào cơ sở dữ liệu
            hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Vai trò hiện tại</th>
                  <th className="px-4 py-3">Khoa / Khóa</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersList.map((u) => {
                  const prof = u.profile;
                  const isLocked = prof?.status === "locked";
                  const isSelf = u.id === current.user.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {prof?.fullName || u.name}
                          {isSelf && (
                            <span className="ml-2 text-[10px] text-primary font-bold">
                              (Bạn)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {u.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getRoleBadge(prof?.role || "student")}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {prof?.batchYear ? `K${prof.batchYear}` : "—"}{" "}
                        {prof?.faculty ? `• ${prof.faculty}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        {isLocked ? (
                          <Badge
                            variant="outline"
                            className="text-rose-600 border-rose-500/20 text-xs gap-1"
                          >
                            <Ban className="h-3 w-3" /> Đã khóa
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-emerald-600 border-emerald-500/20 text-xs gap-1"
                          >
                            <CheckCircle className="h-3 w-3" /> Hoạt động
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <UserRowActions
                          userId={u.id}
                          currentRole={(prof?.role as any) || "student"}
                          currentStatus={prof?.status || "active"}
                          isSelf={isSelf}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
