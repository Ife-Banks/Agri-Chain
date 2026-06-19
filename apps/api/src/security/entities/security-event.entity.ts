import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_FAILED = 'REGISTER_FAILED',
  OTP_REQUESTED = 'OTP_REQUESTED',
  OTP_VERIFY_SUCCESS = 'OTP_VERIFY_SUCCESS',
  OTP_VERIFY_FAILED = 'OTP_VERIFY_FAILED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  LOGOUT = 'LOGOUT',
  PIN_VERIFY_SUCCESS = 'PIN_VERIFY_SUCCESS',
  PIN_VERIFY_FAILED = 'PIN_VERIFY_FAILED',
  PIN_UPDATE = 'PIN_UPDATE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  UNUSUAL_IP = 'UNUSUAL_IP',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  API_ERROR = 'API_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SUSPICIOUS_TRAFFIC = 'SUSPICIOUS_TRAFFIC',
  brute_FORCE_DETECTED = 'BRUTE_FORCE_DETECTED',
}

@Entity('security_events')
@Index(['ip', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['eventType', 'createdAt'])
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  eventType: SecurityEventType;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent: string | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  identifier: string | null;

  @Column({ type: 'int', default: 0 })
  attemptCount: number;

  @Column({ type: 'boolean', default: false })
  suspicious: boolean;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}