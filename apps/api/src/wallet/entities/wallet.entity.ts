import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity('payment_wallet')
export class Wallet {
  @ApiProperty({ example: 'a8b9c0d1-e2f3-4567-8901-234567890123' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.wallets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ example: 50000.00 })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @ApiPropertyOptional({ example: 'John Farmer' })
  @Column({ name: 'account_name', length: 255, nullable: true })
  accountName: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @Column({ name: 'account_number', length: 20, nullable: true })
  accountNumber: string;

  @ApiPropertyOptional({ example: 'First Bank of Nigeria' })
  @Column({ length: 100, nullable: true })
  bank: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @ApiPropertyOptional()
  @Column({ name: 'pin_hash', length: 255, nullable: true })
  pinHash: string;

  @ApiProperty({ example: false })
  @Column({ name: 'is_frozen', default: false })
  isFrozen: boolean;

  @ApiPropertyOptional({ description: 'Wallet creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Wallet last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => WalletTransaction, tx => tx.wallet)
  transactions: WalletTransaction[];
}