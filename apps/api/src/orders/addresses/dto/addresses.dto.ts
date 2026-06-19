import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAddressDto {
  @ApiProperty({ example: 'Home' })
  @IsString()
  @MaxLength(100)
  label: string;

  @ApiProperty({ example: '25 Adeola Odeku Street, Victoria Island' })
  @IsString()
  @MaxLength(255)
  line1: string;

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Lagos State' })
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiPropertyOptional({ example: 6.4281 })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ example: 3.4219 })
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  label?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  line1?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}