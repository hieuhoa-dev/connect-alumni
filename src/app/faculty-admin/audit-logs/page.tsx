import { getAuditLogs } from "@/actions/audit-actions";
import { requireRole } from "@/lib/permissions";
import { ShieldCheck } from "lucide-react";
import { AuditLogsTable } from "./audit-logs-table";

export const metadata = {
  title: "Nhật ký Hệ thống (Audit Logs) | Quản trị viên Khoa",
};

const AuditLogsPage = async () => {
  // Hard security guard Layer 2
  await requireRole("admin");
  const logs = await getAuditLogs(150);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Nhật Ký Thao Tác Hệ Thống (Audit Logs)
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Hệ thống ghi nhận bất biến mọi thao tác nhạy cảm: duyệt bài tuyển dụng, phê duyệt hồ sơ, xác nhận tiền tài trợ và cập nhật quyền hạn.
        </p>
      </div>

      <AuditLogsTable initialData={logs} />
    </div>
  );
};

export default AuditLogsPage;
