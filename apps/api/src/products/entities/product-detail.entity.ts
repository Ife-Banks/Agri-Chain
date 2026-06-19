import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from './product.entity';

@Entity('commerce_productdetail')
export class ProductDetail {
  @ApiProperty({ example: 'det_abcdef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'e5f6a7b8-c9d0-1234-ef01-345678901234' })
  @Column({ name: 'product_id' })
  productId: string;

  @OneToOne(() => Product, product => product.detail)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiPropertyOptional({ example: 85.50 })
  @Column({ name: 'organic_pct', type: 'decimal', precision: 5, scale: 2, nullable: true })
  organicPct: number;

  @ApiPropertyOptional({ example: '2026-08-15' })
  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: string;

  @ApiPropertyOptional({ example: 360 })
  @Column({ name: 'kcal_per_100g', type: 'int', nullable: true })
  kcalPer100g: number;

  @ApiPropertyOptional({ example: 4.75 })
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;
}