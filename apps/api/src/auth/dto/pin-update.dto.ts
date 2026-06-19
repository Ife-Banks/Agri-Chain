import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PinUpdateDto {
  @ApiProperty()
  @IsString()
  @Length(4, 4)
  oldPin: string;

  @ApiProperty()
  @IsString()
  @Length(4, 4)
  newPin: string;
}
