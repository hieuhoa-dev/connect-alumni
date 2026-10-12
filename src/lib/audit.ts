import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export interface LogAuditParams {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
}

export const logAuditEvent = async ({
  actorId,
  action,
  entityType,
  entityId,
  metadata,
}: LogAuditParams) => {
  try {
    const [log] = await db
      .insert(auditLogs)
      .values({
        actorId,
        action,
        entityType,
        entityId,
        metadata: metadata || null,
      })
      .returning();
    return log;
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
};
