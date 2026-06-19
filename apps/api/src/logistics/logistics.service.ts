import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryBatch } from './entities/delivery-batch.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { Driver } from './entities/driver.entity';
import { Vehicle } from './entities/vehicle.entity';
import { WarehousingRequest } from './entities/warehousing-request.entity';
import { Order } from '../orders/entities/order.entity';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { PushTrackingDto } from './dto/push-tracking.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateWarehousingDto } from './dto/create-warehousing.dto';
import { DeliveryStatus } from './entities/delivery-status.enum';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(DeliveryBatch)
    private readonly batchRepo: Repository<DeliveryBatch>,
    @InjectRepository(TrackingEvent)
    private readonly trackingRepo: Repository<TrackingEvent>,
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(WarehousingRequest)
    private readonly warehousingRepo: Repository<WarehousingRequest>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  // ── Delivery Batches ─────────────────────────────────────────

  async createBatch(orderId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const existing = await this.batchRepo.findOne({ where: { orderId } });
    if (existing) throw new BadRequestException('Delivery batch already exists for this order');

    const batch = this.batchRepo.create({ orderId });
    return this.batchRepo.save(batch);
  }

  async assignDriver(batchId: string, dto: AssignDriverDto) {
    const batch = await this.batchRepo.findOne({ where: { id: batchId } });
    if (!batch) throw new NotFoundException('Delivery batch not found');

    batch.driverId = dto.driverId;
    batch.vehicleId = dto.vehicleId;
    batch.status = DeliveryStatus.ASSIGNED;

    return this.batchRepo.save(batch);
  }

  async updateStatus(batchId: string, dto: UpdateDeliveryStatusDto) {
    const batch = await this.batchRepo.findOne({ where: { id: batchId } });
    if (!batch) throw new NotFoundException('Delivery batch not found');

    batch.status = dto.status;
    if (dto.status === DeliveryStatus.IN_TRANSIT) batch.startedAt = new Date();
    if (dto.status === DeliveryStatus.DELIVERED) batch.deliveredAt = new Date();

    return this.batchRepo.save(batch);
  }

  async getBatch(batchId: string) {
    const batch = await this.batchRepo.findOne({
      where: { id: batchId },
      relations: ['trackingEvents', 'order'],
    });
    if (!batch) throw new NotFoundException('Delivery batch not found');
    return batch;
  }

  // ── Tracking Events ─────────────────────────────────────────

  async pushTracking(batchId: string, dto: PushTrackingDto) {
    const batch = await this.batchRepo.findOne({ where: { id: batchId } });
    if (!batch) throw new NotFoundException('Delivery batch not found');

    const event = this.trackingRepo.create({
      batchId,
      lat: dto.lat,
      lng: dto.lng,
      speedKmh: dto.speedKmh,
      status: dto.status,
      recordedAt: new Date(),
    });

    return this.trackingRepo.save(event);
  }

  async getTracking(batchId: string) {
    return this.trackingRepo.find({
      where: { batchId },
      order: { recordedAt: 'DESC' },
    });
  }

  // ── Drivers ─────────────────────────────────────────────────

  async createDriver(dto: CreateDriverDto) {
    const driver = this.driverRepo.create(dto);
    return this.driverRepo.save(driver);
  }

  async listDrivers(availableOnly = false) {
    const where = availableOnly ? { isAvailable: true } : {};
    return this.driverRepo.find({ where, relations: ['user'] });
  }

  // ── Vehicles ────────────────────────────────────────────────

  async createVehicle(dto: CreateVehicleDto) {
    const vehicle = this.vehicleRepo.create(dto);
    return this.vehicleRepo.save(vehicle);
  }

  async listVehicles() {
    return this.vehicleRepo.find();
  }

  // ── Warehousing ─────────────────────────────────────────────

  async createWarehousing(dto: CreateWarehousingDto) {
    const request = this.warehousingRepo.create(dto);
    return this.warehousingRepo.save(request);
  }

  async listWarehousing(farmerId?: string) {
    const where = farmerId ? { farmerId } : {};
    return this.warehousingRepo.find({ where, order: { createdAt: 'DESC' } });
  }
}
