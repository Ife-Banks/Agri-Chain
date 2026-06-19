import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASS: z.string(),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASS: z.string().optional(),

  JWT_SECRET: z.string(),
  JWT_EXPIRY: z.string().default('7d'),
  PIN_HASH_SALT: z.string(),

  PAYSTACK_SECRET_KEY: z.string(),
  PAYSTACK_PUBLIC_KEY: z.string(),

  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY: z.string(),
  AWS_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  ADMIN_EMAIL: z.string().email(),

  NEXT_PUBLIC_API_URL: z.string(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;
