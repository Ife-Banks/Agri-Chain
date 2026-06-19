import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from '../entities';
import { DatabaseService } from './database.service';

function getDbConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      return {
        url,
        type: 'postgres' as const,
        host: parsed.hostname,
        port: Number(parsed.port) || 5432,
        database: parsed.pathname.replace('/', '') || 'aisuce',
        username: parsed.username || 'postgres',
        password: parsed.password || 'postgres',
        ssl:
          parsed.searchParams.get('sslmode') === 'require' || parsed.searchParams.get('sslmode') === 'verify-full'
            ? { rejectUnauthorized: false }
            : false,
      };
    } catch {
      // fallback to individual vars if URL is malformed
    }
  }
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'aisuce',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...getDbConfig(),
        entities,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
        retryAttempts: 3,
        retryDelay: 3000,
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}