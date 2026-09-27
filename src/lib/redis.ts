import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | undefined;
}

export const getRedisClient = (): Redis => {
  if (process.env.NODE_ENV === "production") {
    return new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  if (!global.__redisClient) {
    global.__redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  return global.__redisClient;
};

export const redis = getRedisClient();
