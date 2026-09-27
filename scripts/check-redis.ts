import 'dotenv/config';
import Redis from 'ioredis';

async function main() {
  const redisUrl = process.env.REDIS_URL || "rediss://default:AawzAAIgcDE1ZDhiMTg1NDkxYzc0MDc5ODlkNDM5NWM5M2M5ZGQ2ZQ@delicate-roughy-44083.upstash.io:6379";
  console.log('Testing Redis url:', redisUrl);
  const client = new Redis(redisUrl, { maxRetriesPerRequest: 1, connectTimeout: 5000 });
  client.on('error', (err) => console.log('Redis error:', err.message));
  try {
    await client.set('test_key', 'hello_redis');
    const val = await client.get('test_key');
    console.log('Redis get test_key:', val);
  } catch (err) {
    console.error('Failed Redis test:', err);
  } finally {
    client.disconnect();
    process.exit(0);
  }
}

main();
