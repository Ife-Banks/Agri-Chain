import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('forex_rates')
export class ForexRate {
  @ApiProperty({ example: 'fx_1234567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'USD' })
  @Column({ name: 'from_currency', length: 3 })
  fromCurrency: string;

  @ApiProperty({ example: 'NGN' })
  @Column({ name: 'to_currency', length: 3 })
  toCurrency: string;

  @ApiProperty({ example: 1550.500000 })
  @Column({ type: 'decimal', precision: 15, scale: 6 })
  rate: number;

  @ApiProperty({ example: 0.50 })
  @Column({ name: 'vat_pct', type: 'decimal', precision: 5, scale: 2, default: 0 })
  vatPct: number;

  @ApiProperty({ example: '2026-06-18T12:00:00Z' })
  @Column({ name: 'fetched_at', type: 'timestamptz' })
  fetchedAt: Date;

  @ApiPropertyOptional({ description: 'Rate creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}