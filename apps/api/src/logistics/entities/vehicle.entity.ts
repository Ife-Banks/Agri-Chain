import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum VehicleType {
  TRUCK = 'TRUCK',
  TRICYCLE = 'TRICYCLE',
  VAN = 'VAN',
}

@Entity('vehicles')
export class Vehicle {
  @ApiProperty({ example: 'veh_abcdef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'LAG-123-XY' })
  @Column({ length: 20 })
  plate: string;

  @ApiProperty({ enum: VehicleType, example: VehicleType.TRUCK })
  @Column({ type: 'varchar', length: 20 })
  type: VehicleType;

  @ApiProperty({ example: true })
  @Column({ name: 'cooling_enabled', default: false })
  coolingEnabled: boolean;

  @ApiPropertyOptional({ example: 'iot_device_abc123' })
  @Column({ name: 'iot_device_id', length: 255, nullable: true })
  iotDeviceId: string;

  @ApiPropertyOptional({ description: 'Vehicle creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}