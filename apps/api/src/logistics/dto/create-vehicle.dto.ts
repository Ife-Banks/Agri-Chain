import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum VehicleType {
  TRUCK = 'TRUCK',
  TRICYCLE = 'TRICYCLE',
  VAN = 'VAN',
}

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  plate: string;

  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  coolingEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iotDeviceId?: string;
}
