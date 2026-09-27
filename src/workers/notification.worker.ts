import { Worker, Job } from "bullmq";
import { and, eq, lt } from "drizzle-orm";
import { getRedisClient } from "../lib/redis";
import { db } from "../db";
import { jobPosts } from "../db/schema";
import {
  NOTIFICATION_QUEUE_NAME,
  JOB_EXPIRE_QUEUE_NAME,
  NotificationPayload,
} from "../lib/notifications";

const connection = getRedisClient();

console.log("🚀 Starting Alumni Notification & Background Worker...");

// 1. Notification Worker
const notificationWorker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  async (job: Job<NotificationPayload & { notificationId: string }>) => {
    const { userId, type, title, body, linkUrl, sendEmail } = job.data;
    console.log(`[Notification Worker] Processing job ${job.id} for user ${userId}:`, title);

    if (sendEmail) {
      // Simulate/integrate email sending service (Resend / Nodemailer / SMTP)
      console.log(`[Email Dispatcher] Simulating email to user ${userId}: "${title}" - "${body}"`);
    }

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
    console.log(`[Job Expiry Worker] Scanning for expired jobs... (${job.name})`);
    const now = new Date();

    const expiredResult = await db
      .update(jobPosts)
      .set({ status: "expired" })
      .where(and(eq(jobPosts.status, "approved"), lt(jobPosts.expiresAt, now)))
      .returning({ id: jobPosts.id, title: jobPosts.title });

    console.log(
      `[Job Expiry Worker] Found and updated ${expiredResult.length} expired job posts.`,
      expiredResult.map((j) => j.title),
    );

    return { expiredCount: expiredResult.length };
  },
  { connection },
);

jobExpiryWorker.on("completed", (job) => {
  console.log(`[Job Expiry Worker] Expiry check ${job.id} completed.`);
});

jobExpiryWorker.on("failed", (job, err) => {
  console.error(`[Job Expiry Worker] Failed with error:`, err);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down workers gracefully...");
  await notificationWorker.close();
  await jobExpiryWorker.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
