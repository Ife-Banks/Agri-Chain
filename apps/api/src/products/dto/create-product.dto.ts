import { IsString, IsNumber, IsOptional, IsEnum, Min, MaxLength, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCondition } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  description: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  kilogram: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  stock: number;

  @ApiProperty({ enum: ProductCondition })
  @IsEnum(ProductCondition)
  condition: ProductCondition;
}
