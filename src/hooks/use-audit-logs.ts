"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditLogs, type AuditLogWithActor } from "@/actions/audit-actions";

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  list: (limit: number) => [...auditLogKeys.all, "list", limit] as const,
};

export const useAuditLogs = (
  limit = 150,
  initialData?: AuditLogWithActor[],
) => {
  return useQuery({
    queryKey: auditLogKeys.list(limit),
    queryFn: () => getAuditLogs(limit),
    initialData,
    refetchInterval: 10000, // Realtime polling every 10 seconds
  });
};
