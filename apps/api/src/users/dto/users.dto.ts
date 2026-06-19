import { IsEmail, IsOptional, IsString, IsBoolean, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { User } from '../entities/user.entity';

export enum UserRoleFilter {
  ALL = 'all',
  ADMIN = 'admin',
  FARMER = 'farmer',
  BUYER = 'buyer',
  AGRIC_ENTERPRISE = 'agric_enterprise',
}

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ default: 'buyer' })
  @IsEnum(['admin', 'farmer', 'buyer', 'agric_enterprise'])
  @IsOptional()
  role?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  username?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateRolesDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isFarmer?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAgricEnterprise?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isFarmCustomer?: boolean;
}

export class UserQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;

  @ApiPropertyOptional({ default: 'all', enum: UserRoleFilter })
  @IsEnum(UserRoleFilter)
  @IsOptional()
  role?: UserRoleFilter = UserRoleFilter.ALL;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ default: 'DESC' })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  isAdmin: boolean;

  @ApiProperty()
  isFarmer: boolean;

  @ApiProperty()
  isAgricEnterprise: boolean;

  @ApiProperty()
  isFarmCustomer: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}