import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @MinLength(10)
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}
