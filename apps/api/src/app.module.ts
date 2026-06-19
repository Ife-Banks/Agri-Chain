import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { WalletModule } from './wallet/wallet.module';
import { LogisticsModule } from './logistics/logistics.module';
import { MarketsModule } from './markets/markets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StorageModule } from './storage/storage.module';
import { AiModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { StoresModule } from './stores/stores.module';
import { CouponsModule } from './coupons/coupons.module';
import { AddressesModule } from './orders/addresses/addresses.module';
import { RedisModule } from './redis/redis.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SecurityModule } from './security/security.module';
import { AbuseModule } from './abuse/abuse.module';

@Module({
  imports: [
    SecurityModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 20,
      },
      {
        name: 'wallet',
        ttl: 60000,
        limit: 30,
      },
      {
        name: 'login',
        ttl: 90000,
        limit: 5,
      },
      {
        name: 'register',
        ttl: 3600000,
        limit: 5,
      },
      {
        name: 'ai',
        ttl: 60000,
        limit: 10,
      },
      {
        name: 'search',
        ttl: 60000,
        limit: 30,
      },
    ]),
    RedisModule,
    SchedulerModule,
    AbuseModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    StoresModule,
    CouponsModule,
    AddressesModule,
    OrdersModule,
    WalletModule,
    LogisticsModule,
    MarketsModule,
    NotificationsModule,
    StorageModule,
    AiModule,
    AdminModule,
    HealthModule,
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}