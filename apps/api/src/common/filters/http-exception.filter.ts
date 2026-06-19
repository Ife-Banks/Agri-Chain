import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, Injectable, Optional } from '@nestjs/common';
import type { Request, Response } from 'express';
import { SecurityService } from '../../security/security.service';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(@Optional() private readonly securityService?: SecurityService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request as any).id ?? 'unknown';
    const userId = (request as any).user?.sub ?? null;
    const ip =
      (request.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      request.socket?.remoteAddress ??
      null;
    const userAgent = request.headers['user-agent'] ?? null;
    const { method, path } = request;
    const startTime = (request as any).startTime ?? Date.now();
    const durationMs = Date.now() - startTime;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        message = Array.isArray(obj.message) ? (obj.message as string[]).join(', ') : (obj.message as string) || message;
        error = (obj.error as string) || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `[${requestId}] Unhandled exception on ${method} ${path}: ${exception.message}`,
        exception.stack,
      );
    }

    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${method} ${path} → ${status} (${durationMs}ms) | IP: ${ip ?? '?'} | UID: ${userId ?? '?'}`,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `[${requestId}] ${method} ${path} → ${status} (${durationMs}ms) | IP: ${ip ?? '?'} | UID: ${userId ?? '?'}`,
      );
    }

    if ((status === 401 || status === 403) && this.securityService) {
      await this.securityService.logApiError(ip, userAgent, userId, path, method, status, message).catch(() => {});
    }

    response.setHeader('X-Request-ID', requestId);
    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path,
      requestId,
    });
  }
}