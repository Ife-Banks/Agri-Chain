import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PinDto {
  @ApiProperty()
  @IsString()
  @Length(4, 4)
  pin: string;
}
