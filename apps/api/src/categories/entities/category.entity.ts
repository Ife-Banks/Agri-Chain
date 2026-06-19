import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('commerce_category')
export class Category {
  @ApiProperty({ example: 'cat_1234567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Grains & Cereals' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ example: 'grains-cereals' })
  @Column({ unique: true, length: 100 })
  slug: string;

  @ApiPropertyOptional({ example: 'https://example.com/icons/grains.png' })
  @Column({ name: 'icon_url', length: 500, nullable: true })
  iconUrl: string;

  @ApiPropertyOptional({ description: 'Category creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Category last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}