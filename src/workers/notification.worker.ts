import { Worker, Job } from "bullmq";
import { and, eq, lt } from "drizzle-orm";
import { getRedisClient } from "../lib/redis";
import { db } from "../db";
import { jobPosts, uploadedFiles } from "../db/schema";
import { deleteFile } from "../lib/storage";
import {
  NOTIFICATION_QUEUE_NAME,
  JOB_EXPIRE_QUEUE_NAME,
  FILE_CLEANUP_QUEUE_NAME,
  NotificationPayload,
  scheduleJobExpiryCheck,
  scheduleFileCleanupJob,
} from "../lib/notifications";

const connection = getRedisClient();

console.log("🚀 Starting Alumni Notification & Background Worker...");

// Initialize repeatable job schedules
scheduleJobExpiryCheck()
  .then(() => console.log("✅ Scheduled recurring job post expiry check."))
  .catch((err) => console.error("❌ Failed to schedule recurring job expiry:", err));

scheduleFileCleanupJob()
  .then(() => console.log("✅ Scheduled recurring file cleanup job."))
  .catch((err) => console.error("❌ Failed to schedule file cleanup job:", err));

// 1. In-App Notification Worker (no email dispatching)
const notificationWorker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  async (job: Job<NotificationPayload & { notificationId: string }>) => {
    const { userId, type, title } = job.data;
    console.log(
      `[Notification Worker] Processed in-app notification ${job.id} for user ${userId} [${type}]: ${title}`,
    );

    return { success: true, processedAt: new Date().toISOString() };
  },
  { connection },
);

notificationWorker.on("completed", (job) => {
  console.log(`[Notification Worker] Job ${job.id} completed successfully.`);
});

notificationWorker.on("failed", (job, err) => {
  console.error(`[Notification Worker] Job ${job?.id} failed with error:`, err);
});

// 2. Job Expiry Worker
const jobExpiryWorker = new Worker(
  JOB_EXPIRE_QUEUE_NAME,
  async (job: Job) => {
    console.log(
      `[Job Expiry Worker] Scanning for expired jobs... (${job.name})`,
    );
    const now = new Date();

    try {
      // Find all active/pending job posts where expiresAt < now
      const expiredJobs = await db
        .select({ id: jobPosts.id, title: jobPosts.title })
        .from(jobPosts)
        .where(
          and(
            eq(jobPosts.status, "approved"),
            lt(jobPosts.expiresAt, now),
          ),
        );

      if (expiredJobs.length > 0) {
        console.log(`Found ${expiredJobs.length} expired jobs to update.`);

        for (const j of expiredJobs) {
          await db
            .update(jobPosts)
            .set({ status: "expired" })
            .where(eq(jobPosts.id, j.id));
          console.log(`  - Marked job "${j.title}" (${j.id}) as expired.`);
        }
      } else {
        console.log("No expired jobs found.");
      }

      return { expiredCount: expiredJobs.length };
    } catch (err) {
      console.error("[Job Expiry Worker] Error updating expired jobs:", err);
      throw err;
    }
  },
  { connection },
);

jobExpiryWorker.on("completed", (job) => {
  console.log(`[Job Expiry Worker] Job ${job.id} finished successfully.`);
});

jobExpiryWorker.on("failed", (job, err) => {
  console.error(`[Job Expiry Worker] Job ${job?.id} failed with error:`, err);
});

// 3. File Cleanup Worker (deletes pending uploads older than 24h)
const fileCleanupWorker = new Worker(
  FILE_CLEANUP_QUEUE_NAME,
  async (job: Job) => {
    console.log(`[File Cleanup Worker] Scanning for abandoned pending uploads... (${job.name})`);
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    try {
      const abandonedFiles = await db
        .select({ id: uploadedFiles.id, fileKey: uploadedFiles.fileKey })
        .from(uploadedFiles)
        .where(
          and(
            eq(uploadedFiles.status, "pending"),
            lt(uploadedFiles.createdAt, cutoff),
          ),
        );

      if (abandonedFiles.length > 0) {
        console.log(`Found ${abandonedFiles.length} abandoned pending files.`);
        for (const file of abandonedFiles) {
          try {
            await deleteFile(file.fileKey);
          } catch (storageErr) {
            console.warn(`Could not delete storage key ${file.fileKey}:`, storageErr);
          }
          await db
            .update(uploadedFiles)
            .set({ status: "removed" })
            .where(eq(uploadedFiles.id, file.id));
          console.log(`  - Cleaned up abandoned file: ${file.id}`);
        }
      } else {
        console.log("No abandoned pending files found.");
      }

      return { cleanedCount: abandonedFiles.length };
    } catch (err) {
      console.error("[File Cleanup Worker] Error cleaning up files:", err);
      throw err;
    }
  },
  { connection },
);

fileCleanupWorker.on("completed", (job) => {
  console.log(`[File Cleanup Worker] Job ${job.id} finished successfully.`);
});

fileCleanupWorker.on("failed", (job, err) => {
  console.error(`[File Cleanup Worker] Job ${job?.id} failed with error:`, err);
});
