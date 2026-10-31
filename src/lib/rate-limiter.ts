import { redis } from "@/lib/redis";

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
  isCritical?: boolean; // When true (e.g. AI), rejects if Redis is offline
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetSeconds: number;
  error?: string;
}

/**
 * Task A6: Redis-backed rate limiter with graceful failure handling.
 * - Standard endpoints: if Redis fails, logs warning and allows through.
 * - Critical endpoints (AI/expensive): if Redis fails, rejects request for safety.
 */
export async function checkRateLimit({
  key,
  limit,
  windowSeconds,
  isCritical = false,
}: RateLimitOptions): Promise<RateLimitResult> {
  const rateLimitKey = `rate_limit:${key}`;

  try {
    const current = await redis.incr(rateLimitKey);
    if (current === 1) {
      await redis.expire(rateLimitKey, windowSeconds);
    }

    const ttl = await redis.ttl(rateLimitKey);
    const resetSeconds = ttl > 0 ? ttl : windowSeconds;

    if (current > limit) {
      return {
        success: false,
        remaining: 0,
        resetSeconds,
        error: `Bạn đã vượt quá giới hạn tần suất yêu cầu. Vui lòng thử lại sau ${resetSeconds} giây.`,
      };
    }

    return {
      success: true,
      remaining: Math.max(0, limit - current),
      resetSeconds,
    };
  } catch (err) {
    if (isCritical) {
      console.error(
        `[RateLimiter] Critical rate limit check failed (Redis offline) for key: ${key}`,
        err,
      );
      return {
        success: false,
        remaining: 0,
        resetSeconds: windowSeconds,
        error:
          "Hệ thống đang quá tải hoặc tạm gián đoạn. Vui lòng thử lại sau ít phút.",
      };
    }

    // Standard endpoints: log warning and allow through gracefully
    console.warn(
      `[RateLimiter] Redis offline for non-critical rate limit (${key}), allowing request through.`,
    );
    return {
      success: true,
      remaining: 1,
      resetSeconds: 0,
    };
  }
}
