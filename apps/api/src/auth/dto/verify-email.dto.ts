import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsUUID()
  userId: string;
}