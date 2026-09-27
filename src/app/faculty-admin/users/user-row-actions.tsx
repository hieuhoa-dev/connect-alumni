"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminToggleUserLock, adminUpdateUserRole } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { UserRole } from "@/db/schema";

interface UserRowActionsProps {
  userId: string;
  currentRole: UserRole;
  currentStatus: string;
  isSelf: boolean;
}

export const UserRowActions = ({
  userId,
  currentRole,
  currentStatus,
  isSelf,
}: UserRowActionsProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(currentRole);

  const handleRoleChange = async (newRole: UserRole) => {
    if (isSelf) {
      toast.error("Không thể tự thay đổi vai trò của chính mình!");
      return;
    }

    setLoading(true);
    try {
      await adminUpdateUserRole(userId, newRole);
      setRole(newRole);
      toast.success("Cập nhật vai trò người dùng thành công");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi cập nhật vai trò");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async () => {
    if (isSelf) {
      toast.error("Không thể tự khóa tài khoản của chính mình!");
      return;
    }

    const willLock = currentStatus !== "locked";
    const confirmMsg = willLock
      ? "Bạn có chắc chắn muốn khóa tài khoản này?"
      : "Bạn có chắc chắn muốn mở khóa tài khoản này?";

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      await adminToggleUserLock(userId, willLock);
      toast.success(willLock ? "Đã khóa tài khoản người dùng" : "Đã mở khóa tài khoản");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi thao tác");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={role}
        onValueChange={(val: any) => handleRoleChange(val)}
        disabled={loading || isSelf}
      >
        <SelectTrigger className="h-8 text-xs w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Sinh viên</SelectItem>
          <SelectItem value="alumni">Cựu sinh viên</SelectItem>
          <SelectItem value="employer">Doanh nghiệp</SelectItem>
          <SelectItem value="faculty_staff">Giáo vụ Khoa</SelectItem>
          <SelectItem value="admin">Quản trị viên</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleLock}
        disabled={loading || isSelf}
        className={`h-8 w-8 p-0 ${
          currentStatus === "locked"
            ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
        }`}
        title={currentStatus === "locked" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : currentStatus === "locked" ? (
          <Unlock className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
