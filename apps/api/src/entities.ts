import { User } from './users/entities/user.entity';
import { RefreshToken } from './users/entities/refresh-token.entity';
import { Store } from './stores/entities/store.entity';
import { Category } from './categories/entities/category.entity';
import { Product } from './products/entities/product.entity';
import { ProductImage } from './products/entities/product-image.entity';
import { ProductDetail } from './products/entities/product-detail.entity';
import { Cart } from './orders/entities/cart.entity';
import { CartItem } from './orders/entities/cart-item.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Address } from './orders/entities/address.entity';
import { Coupon } from './coupons/coupon.entity';
import { Wallet } from './wallet/entities/wallet.entity';
import { WalletTransaction } from './wallet/entities/wallet-transaction.entity';
import { QrToken } from './wallet/entities/qr-token.entity';
import { BankBeneficiary } from './wallet/entities/bank-beneficiary.entity';
import { ForexRate } from './wallet/entities/forex-rate.entity';
import { DeliveryBatch } from './logistics/entities/delivery-batch.entity';
import { TrackingEvent } from './logistics/entities/tracking-event.entity';
import { Driver } from './logistics/entities/driver.entity';
import { Vehicle } from './logistics/entities/vehicle.entity';
import { WarehousingRequest } from './logistics/entities/warehousing-request.entity';
import { Commodity } from './markets/entities/commodity.entity';
import { CommodityPrice } from './markets/entities/commodity-price.entity';
import { FarmPosition } from './markets/entities/farm-position.entity';
import { Watchlist } from './markets/entities/watchlist.entity';
import { WeatherAlert } from './markets/entities/weather-alert.entity';
import { PriceAlert } from './markets/entities/price-alert.entity';
import { Notification } from './notifications/entities/notification.entity';
import { SecurityEvent } from './security/entities/security-event.entity';
import { EmailVerification } from './auth/entities/email-verification.entity';
import { PasswordReset } from './auth/entities/password-reset.entity';

export const entities = [
  User,
  RefreshToken,
  Store,
  Category,
  Product,
  ProductImage,
  ProductDetail,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Address,
  Coupon,
  Wallet,
  WalletTransaction,
  QrToken,
  BankBeneficiary,
  ForexRate,
  DeliveryBatch,
  TrackingEvent,
  Driver,
  Vehicle,
  WarehousingRequest,
  Commodity,
  CommodityPrice,
  FarmPosition,
  Watchlist,
  WeatherAlert,
  PriceAlert,
  Notification,
  SecurityEvent,
  EmailVerification,
  PasswordReset,
];

export {
  User,
  RefreshToken,
  Store,
  Category,
  Product,
  ProductImage,
  ProductDetail,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Address,
  Coupon,
  Wallet,
  WalletTransaction,
  QrToken,
  BankBeneficiary,
  ForexRate,
  DeliveryBatch,
  TrackingEvent,
  Driver,
  Vehicle,
  WarehousingRequest,
  Commodity,
  CommodityPrice,
  FarmPosition,
  Watchlist,
  WeatherAlert,
  PriceAlert,
  Notification,
};
