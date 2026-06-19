import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Order } from '../../orders/entities/order.entity';
import { TrackingEvent } from './tracking-event.entity';
import { DeliveryStatus } from './delivery-status.enum';

@Entity('delivery_batches')
export class DeliveryBatch {
  @ApiProperty({ example: 'db_1234567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ApiPropertyOptional({ example: 'drv_abcdef1234567890' })
  @Column({ name: 'driver_id', nullable: true })
  driverId: string;

  @ApiPropertyOptional({ example: 'veh_1234567890abcdef' })
  @Column({ name: 'vehicle_id', nullable: true })
  vehicleId: string;

  @ApiProperty({ enum: DeliveryStatus, example: DeliveryStatus.PENDING })
  @Column({ type: 'varchar', length: 20, default: DeliveryStatus.PENDING })
  status: DeliveryStatus;

  @ApiPropertyOptional({ example: '2026-06-18T08:00:00Z' })
  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date;

  @ApiPropertyOptional({ example: '2026-06-18T14:30:00Z' })
  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date;

  @ApiPropertyOptional({ description: 'Batch creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => TrackingEvent, event => event.batch)
  trackingEvents: TrackingEvent[];
}