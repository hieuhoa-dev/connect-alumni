"use client";

import { useAuditLogs } from "@/hooks/use-audit-logs";
import type { AuditLogWithActor } from "@/actions/audit-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Radio } from "lucide-react";

interface AuditLogsTableProps {
  initialData: AuditLogWithActor[];
}

export const AuditLogsTable = ({ initialData }: AuditLogsTableProps) => {
  const { data: logs = initialData, isFetching } = useAuditLogs(
    150,
    initialData,
  );

  const formatAction = (action: string) => {
    if (
      action.includes("publish") ||
      action.includes("approve") ||
      action.includes("fulfill")
    ) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
          {action}
        </Badge>
      );
    }
    if (
      action.includes("reject") ||
      action.includes("lock") ||
      action.includes("cancel")
    ) {
      return (
        <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
          {action}
        </Badge>
      );
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-serif">
            150 bản ghi thao tác gần nhất
          </CardTitle>
          <CardDescription>
            Toàn bộ hành động của Quản trị viên, Giáo vụ và Người dùng được lưu
            trữ an toàn.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
            <Radio className={`h-3 w-3 ${isFetching ? "animate-pulse" : ""}`} />
            Live Polling (10s)
          </span>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">
            Chưa có nhật ký nào được ghi nhận.
          </p>
        ) : (
          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Người thực hiện</th>
                  <th className="px-4 py-3">Hành động</th>
                  <th className="px-4 py-3">Đối tượng</th>
                  <th className="px-4 py-3">Chi tiết (Metadata)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => {
                  const actorName =
                    log.actor?.profile?.fullName ||
                    log.actor?.name ||
                    log.actorId;
                  const actorEmail = log.actor?.email;
                  const metaStr = log.metadata
                    ? JSON.stringify(log.metadata)
                    : null;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/30 transition-colors font-mono text-xs"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-sans">
                        <div className="font-medium text-foreground">
                          {actorName}
                        </div>
                        {actorEmail && (
                          <div className="text-[11px] text-muted-foreground">
                            {actorEmail}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-sans">
                        {formatAction(log.action)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-muted text-[11px] text-muted-foreground">
                          {log.entityType} #{log.entityId.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-[11px] text-muted-foreground">
                        {metaStr || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
