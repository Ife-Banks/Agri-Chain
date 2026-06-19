import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, DataSource } from 'typeorm';
import { SecurityEvent, SecurityEventType } from './entities/security-event.entity';

interface FailedAttempt {
  count: number;
  firstAt: Date;
  identifiers: Set<string>;
}

@Injectable()
export class SecurityService implements OnModuleInit {
  private readonly logger = new Logger(SecurityService.name);
  private failedAttempts = new Map<string, FailedAttempt>();
  private readonly WINDOW_MS = 15 * 60 * 1000;
  private readonly BRUTE_FORCE_THRESHOLD = 5;
  private readonly UNUSUAL_TRAFFIC_THRESHOLD = 200;

  constructor(
    @InjectRepository(SecurityEvent)
    private readonly eventRepo: Repository<SecurityEvent>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.cleanupOldEvents();
  }

  async logAuthEvent(params: {
    eventType: SecurityEventType;
    ip: string | null;
    userAgent: string | null;
    userId?: string | null;
    identifier?: string | null;
    suspicious?: boolean;
    reason?: string | null;
    metadata?: Record<string, unknown> | null;
    attemptCount?: number;
  }): Promise<void> {
    try {
const event = this.eventRepo.create({
      eventType: params.eventType,
      ip: params.ip,
      userAgent: params.userAgent,
      userId: params.userId ?? null,
      identifier: params.identifier ?? null,
      suspicious: params.suspicious ?? false,
      reason: params.reason ?? null,
      metadata: params.metadata ?? (params.attemptCount != null ? { attemptCount: params.attemptCount } : null),
      attemptCount: params.attemptCount ?? 0,
    });
      await this.eventRepo.save(event);
    } catch (err) {
      this.logger.error(`Failed to persist security event: ${params.eventType}`, err instanceof Error ? err.stack : undefined);
    }
  }

  async logApiError(ip: string | null, userAgent: string | null, userId: string | null, path: string, method: string, statusCode: number, message: string): Promise<void> {
    const suspicious = statusCode === 401 || statusCode === 403;
    await this.logAuthEvent({
      eventType: SecurityEventType.API_ERROR,
      ip,
      userAgent,
      userId,
      suspicious,
      reason: `HTTP ${statusCode}: ${message}`,
      metadata: { path, method, statusCode },
    });
  }

  async detectBruteForce(ip: string, identifier: string): Promise<{ blocked: boolean; attemptCount: number; reason: string | null }> {
    const now = new Date();
    const cutoff = new Date(now.getTime() - this.WINDOW_MS);

    const recentFailed = await this.eventRepo.count({
      where: [
        { ip, eventType: SecurityEventType.LOGIN_FAILED as any, createdAt: MoreThan(cutoff) as any },
        { ip, eventType: SecurityEventType.OTP_VERIFY_FAILED as any, createdAt: MoreThan(cutoff) as any },
      ],
    });

    const entry = this.failedAttempts.get(ip);
    if (entry) {
      if (now.getTime() - entry.firstAt.getTime() > this.WINDOW_MS) {
        this.failedAttempts.delete(ip);
      }
    }

    if (recentFailed >= this.BRUTE_FORCE_THRESHOLD) {
      await this.logAuthEvent({
        eventType: SecurityEventType.brute_FORCE_DETECTED,
        ip,
        userAgent: null,
        identifier,
        suspicious: true,
        reason: `Brute force detected: ${recentFailed} failed attempts from IP in 15 min window`,
        attemptCount: recentFailed,
        metadata: { windowMs: this.WINDOW_MS, threshold: this.BRUTE_FORCE_THRESHOLD },
      });
      return { blocked: true, attemptCount: recentFailed, reason: 'Too many failed attempts. Please try again later.' };
    }

    return { blocked: false, attemptCount: recentFailed, reason: null };
  }

  async logFailedAuth(ip: string, identifier: string, userAgent: string | null, reason: string): Promise<void> {
    const entry = this.failedAttempts.get(ip);
    if (entry) {
      entry.count += 1;
      entry.identifiers.add(identifier);
    } else {
      this.failedAttempts.set(ip, { count: 1, firstAt: new Date(), identifiers: new Set([identifier]) });
    }

    await this.logAuthEvent({
      eventType: SecurityEventType.LOGIN_FAILED,
      ip,
      userAgent,
      identifier,
      suspicious: false,
      reason,
      attemptCount: this.failedAttempts.get(ip)?.count ?? 1,
    });

    const totalRecent = await this.eventRepo.count({
      where: { ip, eventType: SecurityEventType.LOGIN_FAILED as any },
    });

    if (totalRecent >= this.BRUTE_FORCE_THRESHOLD) {
      this.logger.warn(`[SECURITY] Brute force detected from IP: ${ip} — ${totalRecent} failed attempts`);
      await this.logAuthEvent({
        eventType: SecurityEventType.brute_FORCE_DETECTED,
        ip,
        userAgent,
        identifier,
        suspicious: true,
        reason: `IP exceeded threshold: ${totalRecent} failed attempts`,
        attemptCount: totalRecent,
      });
    }
  }

  async getRecentLoginFailures(ip: string): Promise<number> {
    const cutoff = new Date(Date.now() - this.WINDOW_MS);
    return this.eventRepo.count({
      where: { ip, eventType: SecurityEventType.LOGIN_FAILED as any, createdAt: MoreThan(cutoff) as any },
    });
  }

  async logSuspiciousTraffic(ip: string, userAgent: string | null, path: string, method: string): Promise<void> {
    await this.logAuthEvent({
      eventType: SecurityEventType.SUSPICIOUS_TRAFFIC,
      ip,
      userAgent,
      suspicious: true,
      reason: `Unusual traffic pattern detected: ${method} ${path}`,
      metadata: { path, method },
    });
  }

  async getSecuritySummary(userId?: string): Promise<{
    totalEvents: number;
    failedLogins: number;
    successfulLogins: number;
    bruteForceEvents: number;
    suspiciousEvents: number;
    recentEvents: SecurityEvent[];
  }> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const where: any = userId ? { userId, createdAt: MoreThan(cutoff) } : { createdAt: MoreThan(cutoff) };

    const [totalEvents, failedLogins, successfulLogins, bruteForceEvents, suspiciousEvents, recentEvents] = await Promise.all([
      this.eventRepo.count({ where }),
      this.eventRepo.count({ where: { ...where, eventType: SecurityEventType.LOGIN_FAILED } }),
      this.eventRepo.count({ where: { ...where, eventType: SecurityEventType.LOGIN_SUCCESS } }),
      this.eventRepo.count({ where: { ...where, eventType: SecurityEventType.brute_FORCE_DETECTED } }),
      this.eventRepo.count({ where: { ...where, suspicious: true } }),
      this.eventRepo.find({ where, order: { createdAt: 'DESC' }, take: 20 }),
    ]);

    return { totalEvents, failedLogins, successfulLogins, bruteForceEvents, suspiciousEvents, recentEvents };
  }

  private async cleanupOldEvents(): Promise<void> {
    try {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await this.eventRepo
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoff', { cutoff })
        .execute();
      if (result.affected && result.affected > 0) {
        this.logger.log(`[Security] Cleaned up ${result.affected} old security events`);
      }
    } catch (err) {
      this.logger.error('[Security] Cleanup failed', err instanceof Error ? err.stack : undefined);
    }
  }
}