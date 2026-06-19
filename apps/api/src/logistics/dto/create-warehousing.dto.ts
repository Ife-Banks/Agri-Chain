import { IsString, IsUUID, IsNumber, IsDateString, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WarehousingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export class CreateWarehousingDto {
  @ApiProperty()
  @IsUUID()
  farmerId: string;

  @ApiProperty()
  @IsString()
  produceType: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  volumeKg: number;

  @ApiProperty()
  @IsDateString()
  requestedDate: string;

  @ApiProperty({ required: false })
  coolingUnitId?: string;
}
