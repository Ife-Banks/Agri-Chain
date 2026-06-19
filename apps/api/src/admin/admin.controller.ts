import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  AdminUserQueryDto,
  UpdateUserStatusDto,
  AdminOrderQueryDto,
  UpdateOrderStatusDto,
  AdminProductQueryDto,
  ToggleProductStatusDto,
  AdminStoreQueryDto,
  AdminDashboardQueryDto,
  CreateAdminUserDto,
} from './dto/admin.dto';

@ApiTags('Admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard & Analytics ─────────────────────────────────────────────

  @Roles('admin')
  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard with key counts and revenue' })
  async getDashboard(@Query() query: AdminDashboardQueryDto) {
    return this.adminService.getDashboard(query);
  }

  @Roles('admin')
  @Get('analytics')
  @ApiOperation({ summary: 'Deep analytics — top products, stores, revenue trends' })
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Roles('admin')
  @Get('health')
  @ApiOperation({ summary: 'System health check (DB + Redis)' })
  async getHealth() {
    return this.adminService.getHealth();
  }

  // ─── Users ──────────────────────────────────────────────────────────────

  @Roles('admin')
  @Get('users')
  @ApiOperation({ summary: 'List all users (paginated, searchable)' })
  async getUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Roles('admin')
  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID with full relations' })
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Roles('admin')
  @Post('users')
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  async createUser(@Body() dto: CreateAdminUserDto) {
    return this.adminService.createUser(dto);
  }

  @Roles('admin')
  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user status/roles' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto);
  }

  @Roles('admin')
  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a user (admin only)' })
  async deleteUser(@Param('id') id: string) {
    await this.adminService.deleteUser(id);
  }

  // ─── Orders ──────────────────────────────────────────────────────────────

  @Roles('admin')
  @Get('orders')
  @ApiOperation({ summary: 'List all orders (filterable by status)' })
  async getOrders(@Query() query: AdminOrderQueryDto) {
    return this.adminService.getOrders(query);
  }

  @Roles('admin')
  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order with full item details' })
  async getOrder(@Param('id') id: string) {
    return this.adminService.getOrder(id);
  }

  @Roles('admin')
  @Patch('orders/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force-update order status (admin override)' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.adminService.forceUpdateOrderStatus(id, dto);
  }

  // ─── Products ────────────────────────────────────────────────────────────

  @Roles('admin')
  @Get('products')
  @ApiOperation({ summary: 'List all products with optional filters' })
  async getProducts(@Query() query: AdminProductQueryDto) {
    return this.adminService.getProducts(query);
  }

  @Roles('admin')
  @Get('products/:id')
  @ApiOperation({ summary: 'Get product with store/category relations' })
  async getProduct(@Param('id') id: string) {
    return this.adminService.getProduct(id);
  }

  @Roles('admin')
  @Patch('products/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate or deactivate a product listing' })
  async toggleProductStatus(
    @Param('id') id: string,
    @Body() dto: ToggleProductStatusDto,
  ) {
    return this.adminService.toggleProductStatus(id, dto.isActive);
  }

  // ─── Stores ──────────────────────────────────────────────────────────────

  @Roles('admin')
  @Get('stores')
  @ApiOperation({ summary: 'List all stores with verification filter' })
  async getStores(@Query() query: AdminStoreQueryDto) {
    return this.adminService.getStores(query);
  }

  @Roles('admin')
  @Patch('stores/:id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a store' })
  async verifyStore(@Param('id') id: string) {
    return this.adminService.verifyStore(id);
  }

  @Roles('admin')
  @Patch('stores/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a store (admin override)' })
  async deactivateStore(@Param('id') id: string) {
    return this.adminService.deactivateStore(id);
  }

  // ─── Wallets ─────────────────────────────────────────────────────────────

  @Roles('admin')
  @Get('wallets/user/:userId')
  @ApiOperation({ summary: 'Get wallet and transactions for a user' })
  async getWalletByUser(@Param('userId') userId: string) {
    return this.adminService.getWalletByUserId(userId);
  }

  @Roles('admin')
  @Patch('wallets/user/:userId/freeze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Freeze or unfreeze a user wallet' })
  async freezeWallet(
    @Param('userId') userId: string,
    @Body() body: { freeze: boolean },
  ) {
    return this.adminService.freezeWallet(userId, body.freeze);
  }

  // ─── Logistics ──────────────────────────────────────────────────────────

  @Roles('admin')
  @Get('logistics/drivers')
  @ApiOperation({ summary: 'List all drivers' })
  async getDrivers() {
    return this.adminService.getDrivers();
  }

  @Roles('admin')
  @Get('logistics/vehicles')
  @ApiOperation({ summary: 'List all vehicles' })
  async getVehicles() {
    return this.adminService.getVehicles();
  }

  @Roles('admin')
  @Get('logistics/batches')
  @ApiOperation({ summary: 'List recent delivery batches' })
  async getDeliveryBatches() {
    return this.adminService.getDeliveryBatches();
  }
}