import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommodityPrice } from './commodity-price.entity';
import { CommodityCategory } from './commodity-category.enum';

@Entity('commodities')
export class Commodity {
  @ApiProperty({ example: 'cm_1234567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Cocoa' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ example: 'COCOA' })
  @Column({ unique: true, length: 10 })
  symbol: string;

  @ApiProperty({ enum: CommodityCategory, example: CommodityCategory.CASH_CROP })
  @Column({ type: 'varchar', length: 20 })
  category: CommodityCategory;

  @ApiPropertyOptional({ example: 'https://example.com/icons/cocoa.png' })
  @Column({ name: 'icon_url', length: 500, nullable: true })
  iconUrl: string;

  @ApiPropertyOptional({ description: 'Commodity creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Commodity last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CommodityPrice, price => price.commodity)
  prices: CommodityPrice[];
}