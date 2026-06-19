import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Wallet } from './wallet.entity';

@Entity('qr_tokens')
export class QrToken {
  @ApiProperty({ example: 'qr_1234567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a8b9c0d1-e2f3-4567-8901-234567890123' })
  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @ApiProperty({ example: '$2b$10$hashvalueoftoken' })
  @Column({ name: 'token_hash', length: 255 })
  tokenHash: string;

  @ApiPropertyOptional({ example: 5000.00 })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amount?: number;

  @ApiProperty({ example: '2026-06-18T23:59:59Z' })
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @ApiPropertyOptional({ example: '2026-06-18T12:30:00Z' })
  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt: Date;

  @ApiPropertyOptional({ description: 'Token creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}