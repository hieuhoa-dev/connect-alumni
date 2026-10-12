import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | undefined;
  // eslint-disable-next-line no-var
  var __redisErrorLogged: boolean | undefined;
}

export const isRedisConfigured = (): boolean =>
  Boolean(process.env.REDIS_URL?.trim());

/**
 * Singleton Redis client — dùng global để tránh tạo connection mới mỗi
 * lần gọi trong cả development lẫn production (Next.js serverless edge).
 */
export const getRedisClient = (): Redis => {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) {
    throw new Error(
      "REDIS_URL is not configured. Set it to enable background jobs.",
    );
  }

  if (!global.__redisClient) {
    global.__redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (attempt) =>
        attempt > 5 ? null : Math.min(attempt * 1000, 5000),
    });

    global.__redisClient.on("error", (error) => {
      if (!global.__redisErrorLogged) {
        console.warn("Redis connection failed:", error.message);
        global.__redisErrorLogged = true;
      }
    });
    global.__redisClient.on("ready", () => {
      global.__redisErrorLogged = false;
    });
  }
  return global.__redisClient;
};
