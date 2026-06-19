import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityService } from './security.service';
import { SecurityMiddleware } from './security.middleware';
import { SecurityEvent } from './entities/security-event.entity';
import { AbuseModule } from '../abuse/abuse.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SecurityEvent]), AbuseModule],
  providers: [SecurityService, SecurityMiddleware],
  exports: [SecurityService, SecurityMiddleware],
})
export class SecurityModule {}