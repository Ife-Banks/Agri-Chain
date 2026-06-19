import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { WarehousingStatus } from './warehousing-status.enum';

@Entity('warehousing_requests')
export class WarehousingRequest {
  @ApiProperty({ example: 'wr_1234567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Column({ name: 'farmer_id' })
  farmerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'farmer_id' })
  farmer: User;

  @ApiProperty({ example: 'Maize' })
  @Column({ name: 'produce_type', length: 100 })
  produceType: string;

  @ApiProperty({ example: 500.00 })
  @Column({ name: 'volume_kg', type: 'decimal', precision: 10, scale: 2 })
  volumeKg: number;

  @ApiProperty({ example: '2026-06-25' })
  @Column({ name: 'requested_date', type: 'date' })
  requestedDate: string;

  @ApiProperty({ enum: WarehousingStatus, example: WarehousingStatus.PENDING })
  @Column({ type: 'varchar', length: 20, default: WarehousingStatus.PENDING })
  status: WarehousingStatus;

  @ApiPropertyOptional({ example: 'cool_unit_123' })
  @Column({ name: 'cooling_unit_id', nullable: true })
  coolingUnitId: string;

  @ApiPropertyOptional({ description: 'Request creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Request last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}