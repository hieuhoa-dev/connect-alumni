import { Queue } from "bullmq";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { redis } from "@/lib/redis";

export const NOTIFICATION_QUEUE_NAME = "alumni-notifications";
export const JOB_EXPIRE_QUEUE_NAME = "alumni-job-expiry";
export const FILE_CLEANUP_QUEUE_NAME = "alumni-file-cleanup";

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  linkUrl?: string;
}

// Lazy BullMQ queue instances to prevent ECONNREFUSED during Next.js build time
let _notificationQueue: Queue | null = null;
export const getNotificationQueue = (): Queue => {
  if (!_notificationQueue) {
    _notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
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
    _notificationQueue.on("error", (err) => {
      console.error("[NotificationQueue] Queue error:", err);
    });
  }
  return _notificationQueue;
};

export const notificationQueue = new Proxy({} as Queue, {
  get(_target, prop) {
    const queue = getNotificationQueue();
    const value = Reflect.get(queue, prop);
    return typeof value === "function" ? value.bind(queue) : value;
  },
});

let _jobExpiryQueue: Queue | null = null;
export const getJobExpiryQueue = (): Queue => {
  if (!_jobExpiryQueue) {
    _jobExpiryQueue = new Queue(JOB_EXPIRE_QUEUE_NAME, {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: true,
      },
    });
    _jobExpiryQueue.on("error", (err) => {
      console.error("[JobExpiryQueue] Queue error:", err);
    });
  }
  return _jobExpiryQueue;
};

export const jobExpiryQueue = new Proxy({} as Queue, {
  get(_target, prop) {
    const queue = getJobExpiryQueue();
    const value = Reflect.get(queue, prop);
    return typeof value === "function" ? value.bind(queue) : value;
  },
});

let _fileCleanupQueue: Queue | null = null;
export const getFileCleanupQueue = (): Queue => {
  if (!_fileCleanupQueue) {
    _fileCleanupQueue = new Queue(FILE_CLEANUP_QUEUE_NAME, {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: true,
      },
    });
    _fileCleanupQueue.on("error", (err) => {
      console.error("[FileCleanupQueue] Queue error:", err);
    });
  }
  return _fileCleanupQueue;
};

export const fileCleanupQueue = new Proxy({} as Queue, {
  get(_target, prop) {
    const queue = getFileCleanupQueue();
    const value = Reflect.get(queue, prop);
    return typeof value === "function" ? value.bind(queue) : value;
  },
});

/**
 * Task A7: Enqueue notification + save immediately to in-app DB.
 * DB record is the single source of truth; queue failures do not drop the in-app notification.
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

    // 2. Enqueue background job (for in-app push delivery / processing)
    try {
      await notificationQueue.add("send-notification", {
        ...payload,
        notificationId: created?.id,
      });
    } catch (queueErr) {
      // Redis offline: log warning, DB record is safe and retained
      console.warn(
        `[NotificationQueue] Could not enqueue background notification for user ${payload.userId} (Redis offline):`,
        queueErr,
      );
    }

    return created;
  } catch (err) {
    console.error(
      `[Notifications] Failed to save in-app notification in DB for user ${payload.userId}:`,
      err,
    );
    throw err;
  }
};

/**
 * Task A8: Setup hourly job to mark expired job posts using proper BullMQ 6 API
 */
export const scheduleJobExpiryCheck = async () => {
  try {
    await jobExpiryQueue.upsertJobScheduler(
      "repeat-check-expired-jobs",
      { pattern: "0 * * * *" },
      {
        name: "check-expired-jobs",
        data: {},
      },
    );
  } catch (err) {
    console.warn(
      "[JobExpiryQueue] Could not schedule job expiry queue repeat pattern:",
      err,
    );
  }
};

/**
 * Task B1: Setup daily job to clean up uploaded_files in 'pending' status older than 24 hours
 */
export const scheduleFileCleanupJob = async () => {
  try {
    await fileCleanupQueue.upsertJobScheduler(
      "repeat-cleanup-pending-files",
      { pattern: "0 2 * * *" }, // Run daily at 02:00 AM
      {
        name: "cleanup-pending-files",
        data: {},
      },
    );
  } catch (err) {
    console.warn(
      "[FileCleanupQueue] Could not schedule file cleanup repeat pattern:",
      err,
    );
  }
};
