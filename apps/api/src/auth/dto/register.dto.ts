import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RegisterRole {
  FARMER = 'farmer',
  BUYER = 'buyer',
  AGRIC_ENTERPRISE = 'agric_enterprise',
}

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  phone: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: RegisterRole })
  @IsEnum(RegisterRole)
  role: RegisterRole;
}
