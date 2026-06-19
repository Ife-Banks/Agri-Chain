import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';

@Entity('commerce_productimage')
export class ProductImage {
  @ApiProperty({ example: 'img_1234567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'e5f6a7b8-c9d0-1234-ef01-345678901234' })
  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, product => product.images)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({ example: 'products/abc123/rice-image-1.jpg' })
  @Column({ name: 's3_key', length: 500 })
  s3Key: string;

  @ApiProperty({ example: 'https://example.com/products/rice/image1.jpg' })
  @Column({ length: 500 })
  url: string;

  @ApiProperty({ example: true })
  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;
}