import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Commodity } from './commodity.entity';

@Entity('farm_positions')
export class FarmPosition {
  @ApiProperty({ example: 'fp_1234567890abcdef' })
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

  @ApiProperty({ example: 100.0000 })
  @Column({ name: 'units_held', type: 'decimal', precision: 15, scale: 4 })
  unitsHeld: number;

  @ApiProperty({ example: 750000.0000 })
  @Column({ name: 'avg_buy_price', type: 'decimal', precision: 15, scale: 4 })
  avgBuyPrice: number;

  @ApiProperty({ example: '2026-01-15T09:00:00Z' })
  @Column({ name: 'opened_at', type: 'timestamptz' })
  openedAt: Date;

  @ApiPropertyOptional({ description: 'Position creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}