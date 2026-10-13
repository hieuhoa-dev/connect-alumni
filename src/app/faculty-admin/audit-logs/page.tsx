import { ShieldCheck } from "lucide-react";
import { getAuditLogs } from "@/actions/audit-actions";
import { requireRoleOrRedirect } from "@/lib/permissions";
import { AuditLogsTable } from "./audit-logs-table";

export const metadata = {
  title: "Nhật ký Hệ thống (Audit Logs) | Quản trị DLU Alumni",
};

const AuditLogsPage = async () => {
  // Hard security guard Layer 2
  await requireRoleOrRedirect("admin");
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
          Theo dõi các thao tác quản trị: duyệt tin tuyển dụng, phê duyệt hồ sơ,
          xác nhận tài trợ và cập nhật quyền hạn.
        </p>
      </div>

      <AuditLogsTable initialData={logs} />
    </div>
  );
};

export default AuditLogsPage;
