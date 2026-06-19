import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export class AuthResponse {
  @ApiProperty()
  user: Partial<User>;

  @ApiProperty()
  token: string;
}
