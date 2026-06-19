import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Commodity } from '../markets/entities/commodity.entity';
import { CommodityPrice } from '../markets/entities/commodity-price.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
    TypeOrmModule.forFeature([Commodity, CommodityPrice]),
    AuthModule,
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}