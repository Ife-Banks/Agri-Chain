import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyCouponDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  code: string;
}
