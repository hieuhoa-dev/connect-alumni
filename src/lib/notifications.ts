import { Queue } from "bullmq";
import { redis } from "@/lib/redis";
import { db } from "@/db";
import { notifications } from "@/db/schema";

export const NOTIFICATION_QUEUE_NAME = "alumni-notifications";
export const JOB_EXPIRE_QUEUE_NAME = "alumni-job-expiry";

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  linkUrl?: string;
  sendEmail?: boolean;
}

// BullMQ queue instance
export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
  },
});

export const jobExpiryQueue = new Queue(JOB_EXPIRE_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});

/**
 * Enqueue notification + save immediately to in-app DB
 */
export const sendNotification = async (payload: NotificationPayload) => {
  try {
    // 1. Insert in-app notification to DB immediately
    const [created] = await db
      .insert(notifications)
      .values({
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        linkUrl: payload.linkUrl,
        isRead: false,
      })
      .returning();

    // 2. Enqueue background job (for email/push delivery)
    await notificationQueue.add("send-notification", {
      ...payload,
      notificationId: created.id,
    });

    return created;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
};

/**
 * Setup hourly job to mark expired job posts
 */
export const scheduleJobExpiryCheck = async () => {
  try {
    await jobExpiryQueue.add("check-expired-jobs", {}, {
      repeat: {
        pattern: "0 * * * *", // Every hour at minute 0
      },
    } as any);
  } catch (err) {
    console.warn("Could not schedule job expiry queue repeat pattern", err);
  }
};
