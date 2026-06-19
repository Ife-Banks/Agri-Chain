import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike, Between } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/entities/order-status.enum';
import { Product } from '../products/entities/product.entity';
import { Store } from '../stores/entities/store.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { DeliveryBatch } from '../logistics/entities/delivery-batch.entity';
import { Driver } from '../logistics/entities/driver.entity';
import { Vehicle } from '../logistics/entities/vehicle.entity';
import { Category } from '../categories/entities/category.entity';
import { Coupon } from '../coupons/coupon.entity';
import {
  AdminUserQueryDto,
  UpdateUserStatusDto,
  AdminOrderQueryDto,
  UpdateOrderStatusDto,
  AdminProductQueryDto,
  AdminStoreQueryDto,
  AdminDashboardQueryDto,
  CreateAdminUserDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly txRepo: Repository<WalletTransaction>,
    @InjectRepository(DeliveryBatch)
    private readonly batchRepo: Repository<DeliveryBatch>,
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────

  async getDashboard(query: AdminDashboardQueryDto) {
    const { from, to } = query;
    const dateFilter = from && to ? Between(new Date(from), new Date(to)) : undefined;

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalStores,
      totalCategories,
      totalCoupons,
      pendingOrders,
      activeDeliveries,
      verifiedStores,
    ] = await Promise.all([
      this.userRepo.count(),
      this.orderRepo.count(),
      this.productRepo.count(),
      this.storeRepo.count(),
      this.categoryRepo.count(),
      this.couponRepo.count(),
      this.orderRepo.count({ where: { status: OrderStatus.PENDING } }),
      this.batchRepo.count({ where: { status: 'IN_TRANSIT' as any } }),
      this.storeRepo.count({ where: { isVerified: true } }),
    ]);

    const revenueResult = await this.txRepo
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .where('tx.type IN (:...types)', { types: ['DEPOSIT', 'PURCHASE'] })
      .andWhere(dateFilter ? 'tx.createdAt BETWEEN :from AND :to' : '1=1', {
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      })
      .getRawOne();

    const recentOrders = await this.orderRepo.find({
      where: dateFilter
        ? { createdAt: dateFilter as any }
        : undefined,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      counts: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalStores,
        totalCategories,
        totalCoupons,
        pendingOrders,
        activeDeliveries,
        verifiedStores,
      },
      totalRevenue: Number(revenueResult?.total ?? 0),
      recentOrders,
    };
  }

  // ─── Users ─────────────────────────────────────────────────────────────

  async getUsers(
    query: AdminUserQueryDto,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, order = 'DESC' } = query;

    const where: any = {};
    if (search) {
      where.email = ILike(`%${search}%`);
    }

    const [data, total] = await this.userRepo.findAndCount({
      where,
      relations: ['stores', 'wallets'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: order },
    });

    return { data, total, page, limit };
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['stores', 'wallets', 'refreshTokens'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(dto: CreateAdminUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });
    if (existing) {
      throw new ConflictException('Email or username already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      phoneNumber: dto.phone,
      passwordHash,
      isAdmin: dto.isAdmin,
      isFarmer: dto.isFarmer,
      isAgricEnterprise: dto.isAgricEnterprise,
    });

    return this.userRepo.save(user);
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.isAdmin !== undefined) user.isAdmin = dto.isAdmin;
    if (dto.isFarmer !== undefined) user.isFarmer = dto.isFarmer;
    if (dto.isAgricEnterprise !== undefined) user.isAgricEnterprise = dto.isAgricEnterprise;

    return this.userRepo.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
  }

  // ─── Orders ─────────────────────────────────────────────────────────────

  async getOrders(
    query: AdminOrderQueryDto,
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, status, search, order = 'DESC' } = query;

    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['user', 'items'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: order },
    });

    return { data, total, page, limit };
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async forceUpdateOrderStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = dto.status;
    return this.orderRepo.save(order);
  }

  // ─── Products ────────────────────────────────────────────────────────────

  async getProducts(
    query: AdminProductQueryDto,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, order = 'DESC', storeId, isActive } = query;

    const where: any = {};
    if (search) where.title = ILike(`%${search}%`);
    if (storeId) where.storeId = storeId;
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await this.productRepo.findAndCount({
      where,
      relations: ['store', 'category', 'images'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: order },
    });

    return { data, total, page, limit };
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['store', 'category', 'images', 'detail'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async toggleProductStatus(id: string, isActive: boolean): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    product.isActive = isActive;
    return this.productRepo.save(product);
  }

  // ─── Stores ──────────────────────────────────────────────────────────────

  async getStores(
    query: AdminStoreQueryDto,
  ): Promise<{ data: Store[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, order = 'DESC', isVerified } = query;

    const where: any = {};
    if (search) where.name = ILike(`%${search}%`);
    if (isVerified !== undefined) where.isVerified = isVerified;

    const [data, total] = await this.storeRepo.findAndCount({
      where,
      relations: ['farmer', 'products'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: order },
    });

    return { data, total, page, limit };
  }

  async verifyStore(id: string): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { id } });
    if (!store) throw new NotFoundException('Store not found');
    store.isVerified = true;
    return this.storeRepo.save(store);
  }

  async deactivateStore(id: string): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { id } });
    if (!store) throw new NotFoundException('Store not found');
    store.isActive = false;
    return this.storeRepo.save(store);
  }

  // ─── Wallets ─────────────────────────────────────────────────────────────

  async getWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({
      where: { userId },
      relations: ['transactions'],
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async freezeWallet(userId: string, freeze: boolean): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    wallet.isFrozen = freeze;
    return this.walletRepo.save(wallet);
  }

  // ─── Logistics ──────────────────────────────────────────────────────────

  async getDrivers() {
    return this.driverRepo.find({ relations: ['user'] });
  }

  async getVehicles() {
    return this.vehicleRepo.find();
  }

  async getDeliveryBatches() {
    return this.batchRepo.find({
      relations: ['order'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  // ─── System ──────────────────────────────────────────────────────────────

  async getHealth() {
    let dbOk = false;

    try {
      await this.dataSource.query('SELECT 1');
      dbOk = true;
    } catch {}

    return {
      status: dbOk ? 'healthy' : 'degraded',
      database: dbOk ? 'connected' : 'disconnected',
      redis: 'managed via RedisModule (app-level check)',
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Analytics ──────────────────────────────────────────────────────────

  async getAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      ordersByStatus,
      topProducts,
      topStores,
      revenueByDay,
      userGrowth,
    ] = await Promise.all([
      this.orderRepo
        .createQueryBuilder('o')
        .select('o.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('o.status')
        .getRawMany(),

      this.productRepo
        .createQueryBuilder('p')
        .select('p.title', 'title')
        .addSelect('SUM(oi.quantity)', 'unitsSold')
        .leftJoin('p.orderItems', 'oi')
        .groupBy('p.id')
        .orderBy('SUM(oi.quantity)', 'DESC')
        .limit(10)
        .getRawMany(),

      this.storeRepo
        .createQueryBuilder('s')
        .select('s.name', 'name')
        .addSelect('COUNT(DISTINCT o.id)', 'orderCount')
        .leftJoin('s.products', 'p')
        .leftJoin('p.orderItems', 'oi')
        .leftJoin('oi.order', 'o')
        .groupBy('s.id')
        .orderBy('COUNT(DISTINCT o.id)', 'DESC')
        .limit(10)
        .getRawMany(),

      this.txRepo
        .createQueryBuilder('tx')
        .select("DATE_TRUNC('day', tx.createdAt)", 'day')
        .addSelect('SUM(tx.amount)', 'revenue')
        .where('tx.createdAt > :thirtyDaysAgo', { thirtyDaysAgo })
        .andWhere("tx.type IN ('DEPOSIT', 'PURCHASE')")
        .groupBy("DATE_TRUNC('day', tx.createdAt)")
        .orderBy("DATE_TRUNC('day', tx.createdAt)", 'ASC')
        .getRawMany(),

      this.userRepo
        .createQueryBuilder('u')
        .select("DATE_TRUNC('day', u.createdAt)", 'day')
        .addSelect('COUNT(*)', 'count')
        .where('u.createdAt > :thirtyDaysAgo', { thirtyDaysAgo })
        .groupBy("DATE_TRUNC('day', u.createdAt)")
        .orderBy("DATE_TRUNC('day', u.createdAt)", 'ASC')
        .getRawMany(),
    ]);

    return { ordersByStatus, topProducts, topStores, revenueByDay, userGrowth };
  }
}