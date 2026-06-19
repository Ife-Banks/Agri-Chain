import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  async onModuleInit() {
    const url = process.env.REDIS_URL;
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    if (url) {
      this.client = new Redis(url);
    } else {
      this.client = new Redis({
        host,
        port,
        lazyConnect: true,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('[RedisService] Connection failed, running without Redis');
            return null;
          }
          return Math.min(times * 100, 3000);
        },
      });
    }

    this.client.on('error', () => {});
    try {
      await this.client.connect();
    } catch {
      console.warn('[RedisService] Could not connect to Redis — OTP/refresh tokens will be in-memory');
    }
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client || this.client.status !== 'ready') return;
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || this.client.status !== 'ready') return null;
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    if (!this.client || this.client.status !== 'ready') return;
    await this.client.del(key);
  }

  async addToSet(setKey: string, member: string, ttlSeconds?: number): Promise<void> {
    if (!this.client || this.client.status !== 'ready') return;
    await this.client.sadd(setKey, member);
    if (ttlSeconds) {
      await this.client.expire(setKey, ttlSeconds);
    }
  }

  async isInSet(setKey: string, member: string): Promise<boolean> {
    if (!this.client || this.client.status !== 'ready') return false;
    return (await this.client.sismember(setKey, member)) === 1;
  }

  async generateOtp(identifier: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.set(`otp:${identifier}`, code, 300);
    return code;
  }

  async validateOtp(identifier: string, code: string): Promise<boolean> {
    const stored = await this.get(`otp:${identifier}`);
    if (!stored || stored !== code) return false;
    await this.del(`otp:${identifier}`);
    return true;
  }

  async blacklistToken(jti: string, remainingSeconds: number): Promise<void> {
    if (remainingSeconds <= 0) return;
    await this.addToSet('token:blacklist', jti, remainingSeconds + 10);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    return this.isInSet('token:blacklist', jti);
  }

  getClient(): Redis | null {
    return this.client?.status === 'ready' ? this.client : null;
  }
}