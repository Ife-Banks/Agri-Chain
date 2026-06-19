import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Wallet } from './wallet.entity';

@Entity('bank_beneficiaries')
export class BankBeneficiary {
  @ApiProperty({ example: 'bb_abcdef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a8b9c0d1-e2f3-4567-8901-234567890123' })
  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @ApiProperty({ example: 'First Bank of Nigeria' })
  @Column({ name: 'bank_name', length: 255 })
  bankName: string;

  @ApiProperty({ example: '2034567890' })
  @Column({ name: 'account_number', length: 20 })
  accountNumber: string;

  @ApiProperty({ example: 'John Farmer' })
  @Column({ name: 'account_name', length: 255 })
  accountName: string;

  @ApiPropertyOptional({ description: 'Beneficiary creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}