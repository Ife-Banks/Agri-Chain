import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Address } from './entities/address.entity';
import { Product } from '../products/entities/product.entity';
import { Coupon } from '../coupons/coupon.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AddressesModule } from './addresses/addresses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Order, OrderItem, Address, Product, Coupon]),
    AddressesModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}