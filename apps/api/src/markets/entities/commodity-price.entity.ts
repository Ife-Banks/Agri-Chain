import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Commodity } from './commodity.entity';

@Entity('commodity_prices')
export class CommodityPrice {
  @ApiProperty({ example: 'pr_abcdef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'cm_1234567890abcdef' })
  @Column({ name: 'commodity_id' })
  commodityId: string;

  @ManyToOne(() => Commodity, commodity => commodity.prices)
  @JoinColumn({ name: 'commodity_id' })
  commodity: Commodity;

  @ApiProperty({ example: 850000.00 })
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  price: number;

  @ApiProperty({ example: '2026-06-18T10:30:00Z' })
  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt: Date;

  @ApiPropertyOptional({ description: 'Price record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}