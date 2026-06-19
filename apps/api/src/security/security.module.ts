import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityService } from './security.service';
import { SecurityMiddleware } from './security.middleware';
import { SecurityEvent } from './entities/security-event.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SecurityEvent])],
  providers: [SecurityService, SecurityMiddleware],
  exports: [SecurityService, SecurityMiddleware],
})
export class SecurityModule {}