import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('drivers')
export class Driver {
  @ApiProperty({ example: 'drv_1234567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiPropertyOptional({ example: 'veh_1234567890abcdef' })
  @Column({ name: 'vehicle_id', nullable: true })
  vehicleId: string;

  @ApiProperty({ example: 'DRV-LIC-123456' })
  @Column({ name: 'license_number', length: 100 })
  licenseNumber: string;

  @ApiProperty({ example: '+2348012345678' })
  @Column({ length: 20 })
  phone: string;

  @ApiProperty({ example: true })
  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @ApiPropertyOptional({ description: 'Driver creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Driver last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}