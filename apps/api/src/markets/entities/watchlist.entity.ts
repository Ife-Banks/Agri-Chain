import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Commodity } from './commodity.entity';

@Entity('watchlist')
export class Watchlist {
  @ApiProperty({ example: 'wl_1234567890abcdef' })
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

  @ApiProperty({ example: '2026-06-01T08:00:00Z' })
  @Column({ name: 'added_at', type: 'timestamptz' })
  addedAt: Date;

  @ApiPropertyOptional({ description: 'Watchlist creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}