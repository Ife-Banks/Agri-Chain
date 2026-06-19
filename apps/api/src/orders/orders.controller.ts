import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ── Cart ───────────────────────────────────────────────────

  @Get('cart')
  @ApiOperation({ summary: 'Get current user active cart' })
  async getCart(@CurrentUser('sub') userId: string) {
    return this.ordersService.getCart(userId);
  }

  @Post('cart/items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addCartItem(@CurrentUser('sub') userId: string, @Body() dto: AddCartItemDto) {
    return this.ordersService.addCartItem(userId, dto);
  }

  @Patch('cart/items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity (0 removes)' })
  async updateCartItem(
    @Param('itemId') itemId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.ordersService.updateCartItem(itemId, userId, dto);
  }

  @Post('cart/coupon')
  @ApiOperation({ summary: 'Validate and apply coupon code' })
  async applyCoupon(@CurrentUser('sub') userId: string, @Body() dto: ApplyCouponDto) {
    return this.ordersService.applyCoupon(userId, dto);
  }

  // ── Orders ─────────────────────────────────────────────────

  @Post('orders')
  @ApiOperation({ summary: 'Create order from cart (checkout)' })
  async createOrder(@CurrentUser('sub') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List orders (buyer: own, farmer: sold)' })
  async findOrders(
    @CurrentUser('sub') userId: string,
    @CurrentUser('roles') roles: string[],
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.findOrders(userId, query, roles.includes('farmer'));
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order detail with items' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('roles') roles: string[],
  ) {
    return this.ordersService.findOne(id, userId, roles.includes('admin'));
  }

  @Patch('orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('roles') roles: string[],
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto, userId, roles.includes('admin'));
  }
}
