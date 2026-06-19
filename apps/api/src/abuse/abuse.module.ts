import { Module, forwardRef } from '@nestjs/common';
import { AbuseProtectionService } from './abuse-protection.service';
import { AbuseController } from './abuse.controller';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [RedisModule, forwardRef(() => AuthModule)],
  controllers: [AbuseController],
  providers: [AbuseProtectionService],
  exports: [AbuseProtectionService],
})
export class AbuseModule {}