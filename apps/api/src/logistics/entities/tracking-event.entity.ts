import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryBatch } from './delivery-batch.entity';

@Entity('tracking_events')
export class TrackingEvent {
  @ApiProperty({ example: 'te_abcdef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'db_1234567890abcdef' })
  @Column({ name: 'batch_id' })
  batchId: string;

  @ManyToOne(() => DeliveryBatch, batch => batch.trackingEvents)
  @JoinColumn({ name: 'batch_id' })
  batch: DeliveryBatch;

  @ApiProperty({ example: 6.5244 })
  @Column({ type: 'double precision' })
  lat: number;

  @ApiProperty({ example: 3.3792 })
  @Column({ type: 'double precision' })
  lng: number;

  @ApiPropertyOptional({ example: 45.5 })
  @Column({ name: 'speed_kmh', type: 'double precision', nullable: true })
  speedKmh: number;

  @ApiProperty({ example: 'IN_TRANSIT' })
  @Column({ length: 50 })
  status: string;

  @ApiProperty({ example: '2026-06-18T10:15:00Z' })
  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt: Date;

  @ApiPropertyOptional({ description: 'Event creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}