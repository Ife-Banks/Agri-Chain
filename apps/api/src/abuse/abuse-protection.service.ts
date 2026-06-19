import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AbuseProtectionService {
  private readonly logger = new Logger(AbuseProtectionService.name);

  private readonly LOGIN_WINDOW_SECS = 900;
  private readonly LOGIN_MAX_ATTEMPTS = 5;
  private readonly REGISTER_WINDOW_SECS = 3600;
  private readonly REGISTER_MAX_FROM_IP = 10;

  constructor(private readonly redis: RedisService) {}

  async recordLoginAttempt(ip: string): Promise<{ attempts: number; blocked: boolean; retryAfterSecs: number }> {
    const key = `abuse:login:${ip}`;
    const count = await this.redis.incrWithExpiry(key, this.LOGIN_WINDOW_SECS);
    const ttl = await this.redis.ttl(key);
    const blocked = count >= this.LOGIN_MAX_ATTEMPTS;
    if (blocked) {
      this.logger.warn(`[Abuse] IP ${ip} blocked from login for ${ttl}s (${count} failures)`);
    }
    return {
      attempts: count,
      blocked,
      retryAfterSecs: blocked ? ttl : 0,
    };
  }

  async recordSuccessfulLogin(ip: string): Promise<void> {
    const key = `abuse:login:${ip}`;
    await this.redis.del(key);
  }

  async recordRegistration(ip: string): Promise<{ count: number; blocked: boolean; retryAfterSecs: number }> {
    const key = `abuse:register:${ip}`;
    const count = await this.redis.incrWithExpiry(key, this.REGISTER_WINDOW_SECS);
    const ttl = await this.redis.ttl(key);
    const blocked = count >= this.REGISTER_MAX_FROM_IP;
    if (blocked) {
      this.logger.warn(`[Abuse] IP ${ip} blocked from registration for ${ttl}s (${count} attempts)`);
    }
    return {
      count,
      blocked,
      retryAfterSecs: blocked ? ttl : 0,
    };
  }

  async getLoginAttempts(ip: string): Promise<{ attempts: number; retryAfterSecs: number }> {
    const key = `abuse:login:${ip}`;
    const count = await this.redis.getCount(key);
    const ttl = await this.redis.ttl(key);
    return { attempts: count, retryAfterSecs: ttl > 0 ? ttl : 0 };
  }

  async isLoginBlocked(ip: string): Promise<boolean> {
    const { attempts } = await this.getLoginAttempts(ip);
    return attempts >= this.LOGIN_MAX_ATTEMPTS;
  }

  async getStats(): Promise<{
    blockedIps: number;
    totalLoginAttemptsTracked: number;
  }> {
    const loginKeys = await this.redis.keys('abuse:login:*');
    const registerKeys = await this.redis.keys('abuse:register:*');

    let activeLoginBlocked = 0;
    for (const key of loginKeys) {
      const count = await this.redis.getCount(key);
      if (count >= this.LOGIN_MAX_ATTEMPTS) activeLoginBlocked++;
    }

    return {
      blockedIps: activeLoginBlocked,
      totalLoginAttemptsTracked: loginKeys.length,
    };
  }

  async clearIpBlocks(ip: string): Promise<void> {
    await this.redis.del(`abuse:login:${ip}`);
    await this.redis.del(`abuse:register:${ip}`);
    this.logger.log(`[Abuse] Blocks cleared for IP ${ip}`);
  }

  isSuspiciousUserAgent(userAgent: string | null): boolean {
    if (!userAgent) return true;
    const suspicious = [
      'curl', 'wget', 'python-requests', 'httpie', 'axios/0.',
      'scrapy', 'playwright', 'puppeteer', 'selenium', 'webdriver',
      'java/', 'go-http', 'ruby', 'perl', 'node-fetch', 'fetch',
    ];
    const ua = userAgent.toLowerCase();
    return suspicious.some((s) => ua.includes(s));
  }

  isKnownBot(userAgent: string | null): boolean {
    if (!userAgent) return true;
    const knownBots = [
      'googlebot', 'bingbot', 'yandex', 'baiduspider',
      'duckduckbot', 'slurp', 'facebot', 'ia_archiver',
    ];
    const ua = userAgent.toLowerCase();
    return knownBots.some((bot) => ua.includes(bot));
  }

  getLoginWindowSecs(): number { return this.LOGIN_WINDOW_SECS; }
  getRegisterMaxFromIp(): number { return this.REGISTER_MAX_FROM_IP; }
}