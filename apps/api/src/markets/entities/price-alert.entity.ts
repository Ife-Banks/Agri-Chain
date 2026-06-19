import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Commodity } from './commodity.entity';

@Entity('price_alerts')
export class PriceAlert {
  @ApiProperty({ example: 'al_abcdef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ example: 'cm_1234567890abcdef' })
  @Column({ name: 'commodity_id' })
  commodityId: string;

  @ManyToOne(() => Commodity)
  @JoinColumn({ name: 'commodity_id' })
  commodity: Commodity;

  @ApiProperty({ enum: ['ABOVE', 'BELOW'], example: 'ABOVE' })
  @Column({ name: 'threshold_type', type: 'varchar', length: 10 })
  thresholdType: 'ABOVE' | 'BELOW';

  @ApiProperty({ example: 900000.0000 })
  @Column({ name: 'threshold_price', type: 'decimal', precision: 15, scale: 4 })
  thresholdPrice: number;

  @ApiPropertyOptional({ example: '2026-06-18T14:30:00Z' })
  @Column({ name: 'triggered_at', type: 'timestamptz', nullable: true })
  triggeredAt: Date;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Alert creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Alert last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}