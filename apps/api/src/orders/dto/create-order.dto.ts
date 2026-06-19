import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID()
  addressId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ enum: ['wallet', 'paystack'] })
  @IsEnum(['wallet', 'paystack'] as const)
  paymentMethod: 'wallet' | 'paystack';
}
