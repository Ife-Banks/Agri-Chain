import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Store } from '../../stores/entities/store.entity';
import { Order } from '../../orders/entities/order.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'john.farmer@example.com' })
  @Column({ unique: true, length: 255 })
  email: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @Column({ name: 'phone_number', unique: true, length: 20, nullable: true })
  phoneNumber: string;

  @ApiProperty({ example: 'johnfarmer' })
  @Column({ unique: true, length: 100 })
  username: string;

  @ApiProperty({ example: '$2b$10$abcdefghijklmnopqrstuvwxyz' })
  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @ApiPropertyOptional()
  @Column({ name: 'pin_hash', length: 255, nullable: true })
  pinHash: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatars/john.jpg' })
  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @ApiProperty({ example: false })
  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean;

  @ApiProperty({ example: true })
  @Column({ name: 'is_farmer', default: false })
  isFarmer: boolean;

  @ApiProperty({ example: false })
  @Column({ name: 'is_agric_enterprise', default: false })
  isAgricEnterprise: boolean;

  @ApiProperty({ example: false })
  @Column({ name: 'is_farm_customer', default: false })
  isFarmCustomer: boolean;

  @ApiPropertyOptional({ description: 'User creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'User last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'User soft delete timestamp' })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => Store, store => store.farmer)
  stores: Store[];

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @OneToMany(() => Wallet, wallet => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => RefreshToken, rt => rt.user)
  refreshTokens: RefreshToken[];
}