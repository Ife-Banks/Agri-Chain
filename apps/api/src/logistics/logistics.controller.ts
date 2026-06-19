import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { PushTrackingDto } from './dto/push-tracking.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateWarehousingDto } from './dto/create-warehousing.dto';

@ApiTags('Logistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  // ── Batches ─────────────────────────────────────────────────

  @Post('batches/:orderId')
  @ApiOperation({ summary: 'Create a delivery batch for an order' })
  async createBatch(@Param('orderId') orderId: string) {
    return this.logisticsService.createBatch(orderId);
  }

  @Patch('batches/:id/assign')
  @ApiOperation({ summary: 'Assign driver and vehicle to batch' })
  async assignDriver(@Param('id') id: string, @Body() dto: AssignDriverDto) {
    return this.logisticsService.assignDriver(id, dto);
  }

  @Patch('batches/:id/status')
  @ApiOperation({ summary: 'Update delivery batch status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateDeliveryStatusDto) {
    return this.logisticsService.updateStatus(id, dto);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get delivery batch with tracking events' })
  async getBatch(@Param('id') id: string) {
    return this.logisticsService.getBatch(id);
  }

  // ── Tracking ────────────────────────────────────────────────

  @Post('batches/:batchId/tracking')
  @ApiOperation({ summary: 'Push GPS tracking event' })
  async pushTracking(@Param('batchId') batchId: string, @Body() dto: PushTrackingDto) {
    return this.logisticsService.pushTracking(batchId, dto);
  }

  @Get('batches/:batchId/tracking')
  @ApiOperation({ summary: 'Get tracking history for a batch' })
  async getTracking(@Param('batchId') batchId: string) {
    return this.logisticsService.getTracking(batchId);
  }

  // ── Drivers ─────────────────────────────────────────────────

  @Post('drivers')
  @ApiOperation({ summary: 'Register a new driver' })
  async createDriver(@Body() dto: CreateDriverDto) {
    return this.logisticsService.createDriver(dto);
  }

  @Get('drivers')
  @ApiOperation({ summary: 'List drivers' })
  @ApiQuery({ name: 'availableOnly', required: false })
  async listDrivers(@Query('availableOnly') availableOnly?: string) {
    return this.logisticsService.listDrivers(availableOnly === 'true');
  }

  // ── Vehicles ────────────────────────────────────────────────

  @Post('vehicles')
  @ApiOperation({ summary: 'Register a new vehicle' })
  async createVehicle(@Body() dto: CreateVehicleDto) {
    return this.logisticsService.createVehicle(dto);
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'List all vehicles' })
  async listVehicles() {
    return this.logisticsService.listVehicles();
  }

  // ── Warehousing ─────────────────────────────────────────────

  @Post('warehousing')
  @ApiOperation({ summary: 'Create warehousing request' })
  async createWarehousing(@Body() dto: CreateWarehousingDto) {
    return this.logisticsService.createWarehousing(dto);
  }

  @Get('warehousing')
  @ApiOperation({ summary: 'List warehousing requests (optional farmer filter)' })
  @ApiQuery({ name: 'farmerId', required: false })
  async listWarehousing(@Query('farmerId') farmerId?: string) {
    return this.logisticsService.listWarehousing(farmerId);
  }
}