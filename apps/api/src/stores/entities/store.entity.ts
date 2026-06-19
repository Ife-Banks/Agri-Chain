import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('commerce_store')
export class Store {
  @ApiProperty({ example: 'f7a8b9c0-d1e2-3456-f013-567890123456' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Greenfield Farm Store' })
  @Column({ length: 255 })
  name: string;

  @Index()
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Column({ name: 'farmer_id' })
  farmerId: string;

  @ManyToOne(() => User, user => user.stores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmer_id' })
  farmer: User;

  @Index({ unique: true })
  @ApiProperty({ example: 'greenfield-farm-store' })
  @Column({ length: 100 })
  slug: string;

  @ApiPropertyOptional({ example: 'Your trusted source for fresh farm produce and organic vegetables' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: '15 Farm Road, Ikeja, Lagos State, Nigeria' })
  @Column({ length: 500 })
  address: string;

  @ApiPropertyOptional({ example: 6.5244 })
  @Column({ type: 'double precision', nullable: true })
  lat: number;

  @ApiPropertyOptional({ example: 3.3792 })
  @Column({ type: 'double precision', nullable: true })
  lng: number;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'greenfieldfarm@example.com' })
  @Column({ length: 255, nullable: true })
  email: string;

  @ApiPropertyOptional({ example: 'https://example.com/stores/greenfield/banner.jpg' })
  @Column({ name: 'banner_url', length: 500, nullable: true })
  bannerUrl: string;

  @ApiPropertyOptional({ example: 'https://example.com/stores/greenfield/logo.jpg' })
  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl: string;

  @ApiProperty({ example: true })
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Store creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Store last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Store soft delete timestamp' })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => Product, product => product.store)
  products: Product[];
}