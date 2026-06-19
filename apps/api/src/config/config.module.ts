import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigController } from './config.controller';
import { AppConfigService } from './config.service';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
  ],
  controllers: [ConfigController],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}