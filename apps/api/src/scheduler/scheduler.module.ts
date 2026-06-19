import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { PriceAlert } from '../markets/entities/price-alert.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { QrToken } from '../wallet/entities/qr-token.entity';
import { CommodityPrice } from '../markets/entities/commodity-price.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([PriceAlert, Notification, QrToken, CommodityPrice]),
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}