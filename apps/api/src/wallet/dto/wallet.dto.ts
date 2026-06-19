import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  MaxLength,
  Length,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class DepositDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiPropertyOptional({ example: 'dep_123456' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @ApiPropertyOptional({ example: { reference: 'PS_12345', channel: 'paystack' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class WithdrawDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(1000)
  amount: number;

  @ApiProperty({ example: 'Access Bank' })
  @IsString()
  @MaxLength(100)
  bank: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @Length(10, 10)
  accountNumber: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(255)
  accountName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

export class TransferDto {
  @ApiProperty({ example: 'wallet-uuid-of-recipient' })
  @IsString()
  recipientWalletId: string;

  @ApiProperty({ example: 2000 })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

export class GenerateQrDto {
  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @IsOptional()
  @Min(100)
  amount?: number;

  @ApiPropertyOptional({ default: 15 })
  @IsNumber()
  @IsOptional()
  @Min(5)
  expiresInMinutes?: number = 15;
}

export class SetBankAccountDto {
  @ApiProperty({ example: 'Access Bank' })
  @IsString()
  @MaxLength(100)
  bank: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @Length(10, 10)
  accountNumber: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(255)
  accountName: string;
}

export class AddBeneficiaryDto {
  @ApiProperty({ example: 'GTBank' })
  @IsString()
  @MaxLength(100)
  bankName: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @Length(10, 10)
  accountNumber: string;

  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @MaxLength(255)
  accountName: string;
}

export class SetPinDto {
  @ApiProperty({ example: '1234' })
  @IsString()
  @Length(4, 4)
  pin: string;
}

export class VerifyPinDto {
  @ApiProperty({ example: '1234' })
  @IsString()
  @Length(4, 4)
  pin: string;
}

export class FreezeWalletDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  freeze: boolean;

  @ApiProperty()
  @IsString()
  @Length(4, 4)
  pin: string;
}

export class TransactionQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT', 'PURCHASE', 'INVESTMENT'] })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ default: 'DESC' })
  @IsString()
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';
}