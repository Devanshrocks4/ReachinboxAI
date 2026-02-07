import Redis from 'ioredis';
import { config } from '../config';

let redisClient: Redis | null = null;

try {
  redisClient = new Redis(config.redis.url);
  redisClient.on('error', (err) => {
    console.log('Redis connection error:', err.message);
  });
} catch (error) {
  console.log('Redis not available for rate limiting');
}

export class RateLimiter {
  static async checkAndIncrement(sender: string): Promise<boolean> {
    if (!redisClient) {
      return true; // Allow if no Redis
    }
    const now = new Date();
    const hourKey = `${sender}:${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}`;

    const currentCount = await redisClient.get(hourKey);
    const count = currentCount ? parseInt(currentCount) : 0;

    if (count >= config.rateLimit.maxEmailsPerHour) {
      return false; // Limit exceeded
    }

    await redisClient.incr(hourKey);
    // Set expiry for the key (next hour)
    const ttl = 3600 - (now.getMinutes() * 60 + now.getSeconds());
    await redisClient.expire(hourKey, ttl);

    return true;
  }

  static async getNextAvailableTime(sender: string): Promise<Date> {
    if (!redisClient) {
      return new Date(Date.now() + 1000); // Next second if no Redis
    }
    const now = new Date();
    let checkTime = new Date(now);

    // Check next hours until we find an available slot
    for (let i = 0; i < 24; i++) {
      const hourKey = `${sender}:${checkTime.getFullYear()}-${checkTime.getMonth() + 1}-${checkTime.getDate()}-${checkTime.getHours()}`;
      const currentCount = await redisClient.get(hourKey);
      const count = currentCount ? parseInt(currentCount) : 0;

      if (count < config.rateLimit.maxEmailsPerHour) {
        return checkTime;
      }

      checkTime.setHours(checkTime.getHours() + 1);
    }

    // If no slot found in 24 hours, return tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}
