import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status.enum';

@Entity('orders')
export class Order {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  @Column({ type: 'varchar', length: 20, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: 15000.00 })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @ApiProperty({ example: 500.00 })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discount: number;

  @ApiProperty({ example: 1500.00 })
  @Column({ name: 'delivery_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  deliveryFee: number;

  @ApiProperty({ example: 200.00 })
  @Column({ name: 'platform_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  platformFee: number;

  @ApiProperty({ example: 16200.00 })
  @Column({ name: 'grand_total', type: 'decimal', precision: 15, scale: 2 })
  grandTotal: number;

  @ApiPropertyOptional({ example: 'addr_1234567890abcdef' })
  @Column({ name: 'delivery_address_id', nullable: true })
  deliveryAddressId: string;

  @ApiPropertyOptional({ description: 'Order creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];
}