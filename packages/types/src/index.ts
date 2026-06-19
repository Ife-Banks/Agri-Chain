export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  username: string;
  role: UserRole;
  isAdmin: boolean;
  isFarmer: boolean;
  isAgricEnterprise: boolean;
  isFarmCustomer: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = "admin",
  FARMER = "farmer",
  AGRIC_ENTERPRISE = "agric_enterprise",
  FARM_CUSTOMER = "farm_customer",
}

export interface Product {
  id: string;
  title: string;
  description: string;
  storeId: string;
  categoryId: string;
  price: number;
  kilogram: number;
  stock: number;
  condition: ProductCondition;
  isActive: boolean;
  images: ProductImage[];
  detail?: ProductDetail;
  createdAt: string;
  updatedAt: string;
}

export enum ProductCondition {
  FRESH = "Fresh",
  DRIED = "Dried",
  PROCESSED = "Processed",
}

export interface ProductImage {
  id: string;
  productId: string;
  s3Key: string;
  url: string;
  isPrimary: boolean;
}

export interface ProductDetail {
  id: string;
  productId: string;
  organicPct?: number;
  expiryDate?: string;
  kcalPer100g?: number;
  rating?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
}

export interface Store {
  id: string;
  name: string;
  farmerId: string;
  address: string;
  lat?: number;
  lng?: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  platformFee: number;
  grandTotal: number;
  deliveryAddressId: string;
  items: OrderItem[];
  createdAt: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  PLACED = "PLACED",
  ASSIGNED = "ASSIGNED",
  ON_THE_WAY = "ON_THE_WAY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  farmerId: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  accountName: string;
  accountNumber: string;
  bank?: string;
  phoneNumber?: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  fee: number;
  balanceAfter: number;
  counterpartWalletId?: string;
  status: TransactionStatus;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  TRANSFER_OUT = "TRANSFER_OUT",
  TRANSFER_IN = "TRANSFER_IN",
  PURCHASE = "PURCHASE",
  INVESTMENT = "INVESTMENT",
  FEE = "FEE",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface Commodity {
  id: string;
  name: string;
  symbol: string;
  category: CommodityCategory;
  iconUrl?: string;
}

export enum CommodityCategory {
  CASH_CROP = "CASH_CROP",
  FOOD_CROP = "FOOD_CROP",
}

export interface CommodityPrice {
  id: string;
  commodityId: string;
  price: number;
  recordedAt: string;
}

export interface FarmPosition {
  id: string;
  userId: string;
  commodityId: string;
  unitsHeld: number;
  avgBuyPrice: number;
  openedAt: string;
}

export interface DeliveryBatch {
  id: string;
  orderId: string;
  driverId: string;
  status: DeliveryStatus;
  startedAt?: string;
  deliveredAt?: string;
}

export enum DeliveryStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
}

export interface TrackingEvent {
  id: string;
  batchId: string;
  lat: number;
  lng: number;
  speedKmh?: number;
  status: string;
  recordedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}
