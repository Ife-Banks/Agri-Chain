import { Injectable, NestMiddleware, Logger, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from './security.service';
import { AbuseProtectionService } from '../abuse/abuse-protection.service';

interface RequestLog {
  timestamp: number;
  ip: string;
  path: string;
  method: string;
}

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private requestLog: RequestLog[] = [];
  private readonly WINDOW_MS = 60 * 1000;
  private readonly ANOMALY_THRESHOLD = 100;
  private readonly BOT_UA_THRESHOLD = 5;

  constructor(
    private readonly securityService: SecurityService,
    private readonly abuseService: AbuseProtectionService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
      ?? req.socket.remoteAddress
      ?? null;
    const userAgent = req.headers['user-agent'] ?? null;
    const path = req.path;
    const method = req.method;

    if (this.abuseService.isSuspiciousUserAgent(userAgent) && !this.abuseService.isKnownBot(userAgent)) {
      this.trackRequest(ip, path, method);
      const windowRequests = this.getRequestsFromIp(ip);
      if (windowRequests > this.BOT_UA_THRESHOLD) {
        this.logger.warn(`[SECURITY] Bot suspected: IP=${ip} UA="${userAgent}" reqs=${windowRequests}`);
        this.securityService.logSuspiciousTraffic(ip ?? 'unknown', userAgent, path, method);
      }
    }

    this.trackRequest(ip, path, method);

    const windowRequests = this.requestLog.filter(
      (r) => Date.now() - r.timestamp < this.WINDOW_MS,
    );

    const requestsFromIp = windowRequests.filter((r) => r.ip === ip);
    if (requestsFromIp.length > this.ANOMALY_THRESHOLD) {
      this.logger.warn(`[SECURITY] High traffic from IP ${ip}: ${requestsFromIp.length} requests/min`);
      this.securityService.logSuspiciousTraffic(ip ?? 'unknown', userAgent, path, method);
    }

    const now = Date.now();
    const recentWindow = this.requestLog.filter((r) => now - r.timestamp < this.WINDOW_MS);

    if (recentWindow.length > this.ANOMALY_THRESHOLD * 3) {
      this.logger.warn(`[SECURITY] Unusual total traffic spike: ${recentWindow.length} requests in 1 min`);
      this.securityService.logSuspiciousTraffic(ip ?? 'unknown', userAgent, path, method);
    }

    res.setHeader('X-Request-ID', req.headers['x-request-id'] as string ?? `mid-${Date.now()}`);
    next();
  }

  private getRequestsFromIp(ip: string | null): number {
    return this.requestLog.filter(
      (r) => r.ip === ip && Date.now() - r.timestamp < this.WINDOW_MS,
    ).length;
  }

  private trackRequest(ip: string | null, path: string, method: string) {
    if (!ip) return;
    this.requestLog.push({ timestamp: Date.now(), ip, path, method });
    this.requestLog = this.requestLog.filter((r) => Date.now() - r.timestamp < 60_000);
  }
}