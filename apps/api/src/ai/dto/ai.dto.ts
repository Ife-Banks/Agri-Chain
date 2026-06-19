import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class DetectDiseaseDto {
  @ApiPropertyOptional({ description: 'Optional symptom text description' })
  @IsString()
  @IsOptional()
  symptoms?: string;

  @ApiPropertyOptional({ description: 'Geographic location of the farm' })
  @IsString()
  @IsOptional()
  location?: string;
}

export class DiseaseDetectionResult {
  @ApiProperty({ example: 'Late Blight' })
  disease: string;

  @ApiProperty({ example: 0.87 })
  confidence: number;

  @ApiProperty({ example: 'Treat with copper-based fungicide. Remove infected plants immediately.' })
  recommendation: string;

  @ApiProperty({ example: false })
  isContagious: boolean;
}

export class PricePredictionDto {
  @ApiProperty({ example: 'c5f2a3b1-1234-5678-90ab-cdef12345678' })
  @IsString()
  commodityId: string;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @IsOptional()
  daysAhead?: number;
}

export class PricePredictionResult {
  @ApiProperty({ example: 'c5f2a3b1-1234-5678-90ab-cdef12345678' })
  commodityId: string;

  @ApiProperty({ example: 'Maize' })
  commodityName: string;

  @ApiProperty({ example: 12500 })
  currentPrice: number;

  @ApiProperty({ example: 13200 })
  predictedPrice: number;

  @ApiProperty({ example: 30 })
  daysAhead: number;

  @ApiProperty({ example: 5.6 })
  predictedChangePercent: number;

  @ApiPropertyOptional({ example: 'upward' })
  trend?: string;
}

export class CropRecommendationDto {
  @ApiProperty({ example: 'Oyo State' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: 'loamy' })
  @IsString()
  @IsOptional()
  soilType?: string;

  @ApiPropertyOptional({ example: '2025-06-01' })
  @IsString()
  @IsOptional()
  plantingDate?: string;

  @ApiPropertyOptional({ example: 10000 })
  @IsNumber()
  @IsOptional()
  budget?: number;
}

export class CropRecommendation {
  @ApiProperty({ example: 'Maize' })
  crop: string;

  @ApiProperty({ example: 'High demand, drought-resistant variety recommended' })
  reason: string;

  @ApiProperty({ example: 'June - July' })
  bestPlantingSeason: string;

  @ApiProperty({ example: 90 })
  expectedYieldDays: number;

  @ApiProperty({ example: 150000 })
  estimatedRevenue: number;

  @ApiProperty({ example: 'low' })
  riskLevel: 'low' | 'medium' | 'high';
}

export class MarketInsightDto {
  @ApiPropertyOptional({ example: 'SOUTHWEST' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ example: 'FOOD_CROP' })
  @IsEnum(['CASH_CROP', 'FOOD_CROP', 'ALL'] as const)
  @IsOptional()
  category?: 'CASH_CROP' | 'FOOD_CROP' | 'ALL';
}

export class MarketInsight {
  @ApiProperty({ example: 'Maize prices trending upward due to dry season supply constraints' })
  summary: string;

  @ApiProperty({ example: 'maize' })
  commodity: string;

  @ApiPropertyOptional({ example: '+12%' })
  priceChange?: string;

  @ApiPropertyOptional({ example: 'Supply shortage expected to push prices higher over next 2 weeks' })
  outlook?: string;
}

export class ChatMessageDto {
  @ApiProperty({ example: 'What is the best fertilizer for tomato farming?' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsString()
  @IsOptional()
  language?: string;
}

export class ChatResponse {
  @ApiProperty({ example: 'For tomato farming, use NPK 10-10-10 at planting...' })
  reply: string;

  @ApiProperty({ example: 'en' })
  language: string;

  @ApiPropertyOptional({ example: ['fertilizer', 'tomato', 'farming'] })
  keywords?: string[];
}