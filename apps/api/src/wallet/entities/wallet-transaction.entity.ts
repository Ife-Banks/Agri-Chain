import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Wallet } from './wallet.entity';
import { TransactionType, TransactionStatus } from './transaction.enum';

@Entity('wallet_transactions')
export class WalletTransaction {
  @ApiProperty({ example: 'b9c0d1e2-f3a4-5678-9012-345678901234' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a8b9c0d1-e2f3-4567-8901-234567890123' })
  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet, wallet => wallet.transactions)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @ApiProperty({ enum: TransactionType, example: TransactionType.TRANSFER_OUT })
  @Column({ type: 'varchar', length: 20 })
  type: TransactionType;

  @ApiProperty({ example: 5000.00 })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({ example: 50.00 })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  fee: number;

  @ApiProperty({ example: 45000.00 })
  @Column({ name: 'balance_after', type: 'decimal', precision: 15, scale: 2 })
  balanceAfter: number;

  @ApiPropertyOptional({ example: 'c0d1e2f3-a4b5-6789-0123-456789012345' })
  @Column({ name: 'counterpart_wallet_id', nullable: true })
  counterpartWalletId: string;

  @ApiProperty({ enum: TransactionStatus, example: TransactionStatus.PENDING })
  @Column({ type: 'varchar', length: 20, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @ApiProperty({ example: 'txn_1234567890abcdef' })
  @Column({ name: 'idempotency_key', unique: true, length: 255 })
  idempotencyKey: string;

  @ApiPropertyOptional({ example: { orderId: 'ord_123', description: 'Payment for order' } })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Transaction creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}