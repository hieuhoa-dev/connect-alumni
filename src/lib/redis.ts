import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | undefined;
}

/**
 * Singleton Redis client — dùng global để tránh tạo connection mới mỗi
 * lần gọi trong cả development lẫn production (Next.js serverless edge).
 */
export const getRedisClient = (): Redis => {
  if (!global.__redisClient) {
    global.__redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return global.__redisClient;
};

export const redis = getRedisClient();
