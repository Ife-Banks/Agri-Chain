import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  otp?: string;
}