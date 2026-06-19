import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('commerce_cartitem')
export class CartItem {
  @ApiProperty({ example: 'ci_1234567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'cart_abcdef1234567890' })
  @Column({ name: 'cart_id' })
  cartId: string;

  @ManyToOne(() => Cart, cart => cart.items)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ApiProperty({ example: 'e5f6a7b8-c9d0-1234-ef01-345678901234' })
  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, product => product.cartItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({ example: 5.00 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;
}