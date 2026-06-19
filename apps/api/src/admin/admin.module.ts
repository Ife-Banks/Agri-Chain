import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Cart } from '../orders/entities/cart.entity';
import { CartItem } from '../orders/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { ProductDetail } from '../products/entities/product-detail.entity';
import { Store } from '../stores/entities/store.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { DeliveryBatch } from '../logistics/entities/delivery-batch.entity';
import { TrackingEvent } from '../logistics/entities/tracking-event.entity';
import { Driver } from '../logistics/entities/driver.entity';
import { Vehicle } from '../logistics/entities/vehicle.entity';
import { Category } from '../categories/entities/category.entity';
import { Coupon } from '../coupons/coupon.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      OrderItem,
      Cart,
      CartItem,
      Product,
      ProductImage,
      ProductDetail,
      Store,
      Wallet,
      WalletTransaction,
      DeliveryBatch,
      TrackingEvent,
      Driver,
      Vehicle,
      Category,
      Coupon,
    ]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}