import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryBatch } from './entities/delivery-batch.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { Driver } from './entities/driver.entity';
import { Vehicle } from './entities/vehicle.entity';
import { WarehousingRequest } from './entities/warehousing-request.entity';
import { Order } from '../orders/entities/order.entity';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryBatch, TrackingEvent, Driver, Vehicle, WarehousingRequest, Order]),
  ],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
