import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CouponDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

@Entity('coupons')
export class Coupon {
  @ApiProperty({ example: 'cpn_abcdef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'SAVE20' })
  @Column({ unique: true, length: 50 })
  code: string;

  @ApiProperty({ enum: CouponDiscountType, example: CouponDiscountType.PERCENTAGE })
  @Column({ name: 'discount_type', type: 'varchar', length: 20, default: CouponDiscountType.PERCENTAGE })
  discountType: CouponDiscountType;

  @ApiProperty({ example: 20.00 })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @ApiProperty({ example: 5000.00 })
  @Column({ name: 'min_order', type: 'decimal', precision: 15, scale: 2, default: 0 })
  minOrder: number;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @Column({ type: 'date', nullable: true })
  expiry: string;

  @ApiPropertyOptional({ example: 100 })
  @Column({ name: 'uses_remaining', type: 'int', nullable: true })
  usesRemaining: number;

  @ApiPropertyOptional({ description: 'Coupon creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Coupon last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}