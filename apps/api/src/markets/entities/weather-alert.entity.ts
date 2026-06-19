import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('weather_alerts')
export class WeatherAlert {
  @ApiProperty({ example: 'wx_abcdef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Lagos' })
  @Column({ length: 100 })
  state: string;

  @ApiProperty({ example: 'HIGH' })
  @Column({ length: 20 })
  severity: string;

  @ApiProperty({ example: 'Heavy rainfall expected in the next 48 hours. Flash flooding possible in low-lying areas.' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ example: '2026-06-18T06:00:00Z' })
  @Column({ name: 'valid_from', type: 'timestamptz' })
  validFrom: Date;

  @ApiProperty({ example: '2026-06-20T06:00:00Z' })
  @Column({ name: 'valid_to', type: 'timestamptz' })
  validTo: Date;

  @ApiPropertyOptional({ example: '2026-06-17T18:00:00Z' })
  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date;

  @ApiPropertyOptional({ description: 'Alert creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}