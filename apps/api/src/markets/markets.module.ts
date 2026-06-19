import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketsController } from './markets.controller';
import { MarketsService } from './markets.service';
import {
  Commodity,
  CommodityPrice,
  FarmPosition,
  PriceAlert,
  Watchlist,
  WeatherAlert,
} from './entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Commodity,
      CommodityPrice,
      FarmPosition,
      PriceAlert,
      Watchlist,
      WeatherAlert,
    ]),
    AuthModule,
  ],
  controllers: [MarketsController],
  providers: [MarketsService],
  exports: [MarketsService],
})
export class MarketsModule {}