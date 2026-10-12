import { Queue } from "bullmq";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getRedisClient, isRedisConfigured } from "@/lib/redis";

export const NOTIFICATION_QUEUE_NAME = "alumni-notifications";
export const JOB_EXPIRE_QUEUE_NAME = "alumni-job-expiry";
const EMAIL_QUEUE_TIMEOUT_MS = 2000;

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  linkUrl?: string;
  sendEmail?: boolean;
}

let notificationQueue: Queue | undefined;
let jobExpiryQueue: Queue | undefined;
let warnedAboutMissingRedis = false;

const getNotificationQueue = (): Queue => {
  if (!notificationQueue) {
    notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
      connection: getRedisClient(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
      },
    });
    notificationQueue.on("error", (error) => {
      console.error("Notification queue connection failed:", error);
    });
  }
  return notificationQueue;
};

const getJobExpiryQueue = (): Queue => {
  jobExpiryQueue ??= new Queue(JOB_EXPIRE_QUEUE_NAME, {
    connection: getRedisClient(),
    defaultJobOptions: {
      removeOnComplete: true,
    },
  });
  return jobExpiryQueue;
};

/**
 * Enqueue notification + save immediately to in-app DB
 */
export const sendNotification = async (payload: NotificationPayload) => {
  let created: typeof notifications.$inferSelect | undefined;

  try {
    [created] = await db
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
  } catch (error) {
    console.error("Failed to save in-app notification:", error);
    return null;
  }

  if (!created) return null;

  if (payload.sendEmail && isRedisConfigured()) {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      // Email là tác vụ tùy chọn; Redis mất kết nối không được giữ thao tác duyệt chờ vô hạn.
      await Promise.race([
        getNotificationQueue().add("send-notification", {
          ...payload,
          notificationId: created.id,
        }),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => {
            reject(new Error("Timed out while queueing notification email"));
          }, EMAIL_QUEUE_TIMEOUT_MS);
        }),
      ]);
    } catch (error) {
      console.error("Could not queue notification email:", error);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  } else if (payload.sendEmail && !warnedAboutMissingRedis) {
    console.warn(
      "REDIS_URL is not configured; in-app notifications are saved, but email jobs are skipped.",
    );
    warnedAboutMissingRedis = true;
  }

  return created;
};

/**
 * Setup hourly job to mark expired job posts
 */
export const scheduleJobExpiryCheck = async () => {
  if (!isRedisConfigured()) return;

  try {
    await getJobExpiryQueue().upsertJobScheduler(
      "hourly-expired-job-check",
      { pattern: "0 * * * *" },
      {
        name: "check-expired-jobs",
        data: {},
      },
    );
  } catch (err) {
    console.warn("Could not schedule job expiry queue repeat pattern", err);
  }
};
