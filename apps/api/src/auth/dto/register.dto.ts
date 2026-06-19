import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, Matches, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({ description: 'Minimum 8 chars, must contain uppercase, lowercase, number and special character' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    {
      message:
        'Password must be 8+ chars with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
    },
  )
  password: string;

  @ApiProperty({ enum: RegisterRole })
  @IsEnum(RegisterRole)
  role: RegisterRole;

  @ApiPropertyOptional({ description: 'Leave empty — bots get caught here' })
  @IsBoolean()
  @IsOptional()
  website?: boolean;
}