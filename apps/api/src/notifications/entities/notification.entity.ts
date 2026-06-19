import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  DELIVERY_UPDATE = 'DELIVERY_UPDATE',
  WALLET_CREDIT = 'WALLET_CREDIT',
  WALLET_DEBIT = 'WALLET_DEBIT',
  PRICE_ALERT = 'PRICE_ALERT',
  WEATHER_ALERT = 'WEATHER_ALERT',
  MARKETING = 'MARKETING',
  SYSTEM = 'SYSTEM',
}

@Entity('notifications')
export class Notification {
  @ApiProperty({ example: 'c0d1e2f3-a4b5-6789-0123-456789abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ enum: NotificationType, example: NotificationType.ORDER_UPDATE })
  @Column({ type: 'varchar', length: 30 })
  type: NotificationType;

  @ApiProperty({ example: 'Order Shipped' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ example: 'Your order #ORD-12345 has been shipped and is on its way to you.' })
  @Column({ type: 'text' })
  body: string;

  @ApiPropertyOptional({ example: { orderId: 'ord_12345', trackingNumber: 'TRK987654' } })
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, unknown>;

  @ApiProperty({ example: false })
  @Column({ default: false })
  read: boolean;

  @ApiPropertyOptional({ description: 'Notification creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}