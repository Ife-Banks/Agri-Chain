import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('addresses')
export class Address {
  @ApiProperty({ example: 'addr_1234567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ example: 'Home' })
  @Column({ length: 100 })
  label: string;

  @ApiProperty({ example: '25 Adeola Odeku Street, Victoria Island' })
  @Column({ name: 'line1', length: 255 })
  line1: string;

  @ApiProperty({ example: 'Lagos' })
  @Column({ length: 100 })
  city: string;

  @ApiProperty({ example: 'Lagos State' })
  @Column({ length: 100 })
  state: string;

  @ApiPropertyOptional({ example: 6.4281 })
  @Column({ type: 'double precision', nullable: true })
  lat: number;

  @ApiPropertyOptional({ example: 3.4219 })
  @Column({ type: 'double precision', nullable: true })
  lng: number;

  @ApiProperty({ example: true })
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @ApiPropertyOptional({ description: 'Address creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}