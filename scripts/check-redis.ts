import "dotenv/config";
import Redis from "ioredis";

async function main() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("Set REDIS_URL before checking the Redis connection.");
  }

  console.log("Testing Redis connection...");
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
  });
  client.on("error", (err) => console.log("Redis error:", err.message));
  try {
    await client.set("test_key", "hello_redis");
    const val = await client.get("test_key");
    console.log("Redis get test_key:", val);
  } catch (err) {
    console.error("Failed Redis test:", err);
    process.exitCode = 1;
  } finally {
    client.disconnect();
  }
}

main();
