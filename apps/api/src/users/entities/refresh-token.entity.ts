import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('refresh_tokens')
@Index(['userId', 'isRevoked'])
export class RefreshToken {
  @ApiProperty({ example: 'rt_1234567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ example: '$2b$10$hashvalueofrefreshtoken' })
  @Column({ name: 'token_hash', length: 255 })
  tokenHash: string;

  @ApiProperty({ example: 'jti_abc123def456ghi789' })
  @Column({ name: 'jti', length: 64, unique: true })
  jti: string;

  @ApiProperty({ example: '2026-07-18T12:00:00Z' })
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @ApiProperty({ example: false })
  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @ApiPropertyOptional({ description: 'Token creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}