import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignDriverDto {
  @ApiProperty()
  @IsUUID()
  driverId: string;

  @ApiProperty()
  @IsUUID()
  vehicleId: string;
}
