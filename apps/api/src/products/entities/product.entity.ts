import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Store } from '../../stores/entities/store.entity';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';
import { ProductDetail } from './product-detail.entity';
import { CartItem } from '../../orders/entities/cart-item.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

export enum ProductCondition {
  FRESH = 'Fresh',
  DRIED = 'Dried',
  PROCESSED = 'Processed',
}

@Entity('commerce_product')
export class Product {
  @ApiProperty({ example: 'e5f6a7b8-c9d0-1234-ef01-345678901234' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Premium Nigerian Rice' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ example: 'High quality locally grown rice from the Niger Delta region' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ example: 'f6a7b8c9-d0e1-2345-f012-456789012345' })
  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => Store, store => store.products)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ApiProperty({ example: 'cat_abcdef1234567890' })
  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty({ example: 25000.00 })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @ApiProperty({ example: 50.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  kilogram: number;

  @ApiProperty({ example: 100 })
  @Column({ type: 'int' })
  stock: number;

  @ApiProperty({ enum: ProductCondition, example: ProductCondition.FRESH })
  @Column({ type: 'varchar', length: 20, default: ProductCondition.FRESH })
  condition: ProductCondition;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Product creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Product last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Product soft delete timestamp' })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => ProductImage, image => image.product)
  images: ProductImage[];

  @OneToOne(() => ProductDetail, detail => detail.product)
  detail: ProductDetail;

  @OneToMany(() => CartItem, cartItem => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];
}