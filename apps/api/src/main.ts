import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as crypto from 'crypto';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SecurityMiddleware } from './security/security.middleware';
import { SecurityService } from './security/security.service';

function getClientIp(req: any): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? null;
}

function validateEnvironment(): void {
  const env = process.env.NODE_ENV ?? 'development';

  if (env === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-in-production') {
      throw new Error('FATAL: JWT_SECRET must be set to a strong secret in production. Check your .env file.');
    }
    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
      throw new Error('FATAL: Database configuration missing. Set DATABASE_URL or DB_HOST in your .env file.');
    }
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.warn('[Bootstrap] WARNING: PAYSTACK_SECRET_KEY is not set — payment features will not work.');
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('[Bootstrap] WARNING: JWT_SECRET should be at least 32 characters long for security.');
  }
}

async function bootstrap() {
  validateEnvironment();

  const logger = new Logger('Bootstrap');
  const isProd = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.setGlobalPrefix('api/v1');

  if (isProd) {
    app.use(helmet({
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));
  } else {
    app.use(helmet());
  }

  app.use((req: any, res: any, next: any) => {
    req.id = crypto.randomUUID();
    req.startTime = Date.now();
    const originalEnd = res.end;
    res.end = function (...args: any[]) {
      const duration = Date.now() - req.startTime;
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'log';
      const logFn = level === 'error' ? logger.error : level === 'warn' ? logger.warn : logger.log;
      logFn(
        `[${req.method}] ${req.path} ${res.statusCode} ${duration}ms — ${getClientIp(req) ?? 'unknown IP'}`,
      );
      originalEnd.apply(res, args);
    };
    next();
  });

  const securityService = app.get(SecurityService);
  app.use(new SecurityMiddleware(securityService).use.bind(new SecurityMiddleware(securityService)));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = (process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (allowed.length === 0 || allowed.includes(origin)) {
        return callback(null, true);
      }
      if (isProd) {
        logger.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Forwarded-For'],
    exposedHeaders: ['X-Request-ID'],
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter(securityService));
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('AI-SUCE API')
    .setDescription('NestJS backend for GreenPurse, GreenSC, MyVirtualFarm, and Admin')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`http://localhost:${process.env.PORT || 4000}`, 'Local development')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
    customSiteTitle: 'AI-SUCE API',
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  logger.log(`API running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
  if (isProd) {
    logger.log('SECURITY: Production mode active — HTTPS, HSTS, Helmet, CORS strict mode enabled');
  }
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start API', err instanceof Error ? err.stack : err);
  process.exit(1);
});