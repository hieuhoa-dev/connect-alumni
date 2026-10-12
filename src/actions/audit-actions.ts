"use server";

import { db } from "@/db";
import { requireRole } from "@/lib/permissions";
import { getPagination } from "@/lib/query-input";

export const getAuditLogs = async (limit = 100) => {
  await requireRole("admin");

  const logs = await db.query.auditLogs.findMany({
    orderBy: {
      createdAt: "desc",
    },
    limit: getPagination({ limit }, 100, 200).limit,
    with: {
      actor: {
        with: {
          profile: true,
        },
      },
    },
  });

  return logs;
};

export type AuditLogWithActor = Awaited<
  ReturnType<typeof getAuditLogs>
>[number];
