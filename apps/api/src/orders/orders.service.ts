import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Coupon } from '../coupons/coupon.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './entities/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
  ) {}

  // ── Cart ──────────────────────────────────────────────────────

  async getCart(userId: string) {
    let cart = await this.cartRepo.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'items.product.images', 'items.product.store'],
    });

    if (!cart) {
      cart = this.cartRepo.create({ userId });
      cart = await this.cartRepo.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async addCartItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getCart(userId);
    const product = await this.productRepo.findOne({ where: { id: dto.productId, isActive: true } });
    if (!product) throw new NotFoundException('Product not found or inactive');

    const existing = cart.items.find((i) => i.productId === dto.productId);
    if (existing) {
      existing.quantity += dto.quantity;
      return this.cartItemRepo.save(existing);
    }

    const item = this.cartItemRepo.create({
      cartId: cart.id,
      productId: dto.productId,
      quantity: dto.quantity,
    });

    return this.cartItemRepo.save(item);
  }

  async updateCartItem(itemId: string, userId: string, dto: UpdateCartItemDto) {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found');

    if (dto.quantity <= 0) {
      return this.cartItemRepo.remove(item);
    }

    item.quantity = dto.quantity;
    return this.cartItemRepo.save(item);
  }

  async applyCoupon(userId: string, dto: ApplyCouponDto) {
    const coupon = await this.couponRepo.findOne({ where: { code: dto.code } });
    if (!coupon) throw new NotFoundException('Invalid coupon code');

    if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usesRemaining !== null && coupon.usesRemaining <= 0) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    const cart = await this.getCart(userId);
    const subtotal = cart.items.reduce((s, i) => s + Number(i.product.price) * Number(i.quantity), 0);

    if (subtotal < Number(coupon.minOrder)) {
      throw new BadRequestException(`Minimum order amount of $${coupon.minOrder} not met`);
    }

    const discount = coupon.discountType === 'PERCENTAGE'
      ? subtotal * (Number(coupon.value) / 100)
      : Number(coupon.value);

    return { code: coupon.code, discount: Math.min(discount, subtotal) };
  }

  // ── Orders ─────────────────────────────────────────────────────

  async createOrder(userId: string, dto: CreateOrderDto) {
    const cart = await this.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const subtotal = cart.items.reduce((s, i) => s + Number(i.product.price) * Number(i.quantity), 0);

    let discount = 0;
    if (dto.couponCode) {
      const coupon = await this.couponRepo.findOne({ where: { code: dto.couponCode } });
      if (coupon) {
        discount = coupon.discountType === 'PERCENTAGE'
          ? subtotal * (Number(coupon.value) / 100)
          : Number(coupon.value);
        discount = Math.min(discount, subtotal);
        if (coupon.usesRemaining !== null) {
          coupon.usesRemaining -= 1;
          await this.couponRepo.save(coupon);
        }
      }
    }

    const deliveryFee = subtotal >= 50 ? 0 : 5;
    const platformFee = (subtotal - discount) * 0.10;
    const grandTotal = subtotal - discount + deliveryFee + platformFee;

    const order = this.orderRepo.create({
      userId,
      subtotal,
      discount,
      deliveryFee,
      platformFee,
      grandTotal,
      deliveryAddressId: dto.addressId,
      status: OrderStatus.PLACED,
    });

    const savedOrder = await this.orderRepo.save(order);

    const orderItems = cart.items.map((item) =>
      this.orderItemRepo.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.product.price),
        subtotal: Number(item.product.price) * Number(item.quantity),
        farmerId: item.product.store.farmerId,
      }),
    );

    await this.orderItemRepo.save(orderItems);

    await this.cartItemRepo.delete({ cartId: cart.id });

    return this.orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: ['items', 'items.product'],
    });
  }

  async findOrders(userId: string, query: OrderQueryDto, isFarmer: boolean) {
    const where: Record<string, unknown> = {};
    if (isFarmer) {
      // Farmers see orders containing their products
      const items = await this.orderItemRepo.find({
        where: { farmerId: userId },
        relations: ['order'],
      });
      const orderIds = [...new Set(items.map((i) => i.orderId))];
      where.id = orderIds.length > 0 ? orderIds : ['none'];
    } else {
      where.userId = userId;
    }
    if (query.status) where.status = query.status;

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['items', 'items.product'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string, isAdmin: boolean) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.product.images'],
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId && !isAdmin) throw new NotFoundException('Order not found');

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, userId: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = dto.status;
    return this.orderRepo.save(order);
  }
}
