import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { RedisService } from '../redis/redis.service';
import { AppConfigService } from '../config/config.service';
import { SecurityService } from '../security/security.service';
import { SecurityEventType } from '../security/entities/security-event.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PinDto } from './dto/pin.dto';
import { PinUpdateDto } from './dto/pin-update.dto';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: AppConfigService,
    private readonly securityService: SecurityService,
  ) {}

  private async logAuth(
    eventType: SecurityEventType,
    params: { ip?: string | null; userAgent?: string | null; userId?: string | null; identifier?: string; suspicious?: boolean; reason?: string; metadata?: Record<string, unknown> },
  ) {
    return this.securityService.logAuthEvent({
      eventType,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
      userId: params.userId ?? null,
      identifier: params.identifier ?? null,
      suspicious: params.suspicious ?? false,
      reason: params.reason ?? null,
      metadata: params.metadata ?? null,
    }).catch(() => {});
  }

  // ─── Registration ────────────────────────────────────────────────────────

  async register(dto: RegisterDto, ip?: string | null, userAgent?: string | null) {
    const existing = await this.userRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });
    if (existing) {
      this.logger.warn(`[AUTH] Register failed — duplicate: ${dto.email} | ${dto.username} | IP: ${ip ?? '?'}`);
      this.logAuth(SecurityEventType.REGISTER_FAILED, { ip, userAgent, identifier: dto.email, reason: 'Email or username already in use' });
      throw new ConflictException('Email or username already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const roles: string[] = [dto.role];

    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      phoneNumber: dto.phone,
      passwordHash,
      isFarmer: dto.role === 'farmer',
      isAgricEnterprise: dto.role === 'agric_enterprise',
      isFarmCustomer: dto.role === 'buyer',
    });

    await this.userRepo.save(user);
    const { accessToken, refreshToken } = await this.generateTokenPair(user, roles);

    this.logger.log(`[AUTH] Registered: ${user.email} (${dto.role}) | IP: ${ip ?? '?'} | UID: ${user.id}`);
    this.logAuth(SecurityEventType.REGISTER_SUCCESS, { ip, userAgent, userId: user.id, identifier: user.email });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, ip?: string | null, userAgent?: string | null) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const identifier = dto.email ?? dto.phone ?? 'unknown';

    const user = await this.userRepo.findOne({
      where: dto.email ? { email: dto.email } : { phoneNumber: dto.phone },
    });

    if (!user) {
      this.logger.warn(`[AUTH] Login failed — user not found: ${identifier} | IP: ${ip ?? '?'}`);
      this.logAuth(SecurityEventType.LOGIN_FAILED, { ip, userAgent, identifier, reason: 'User not found' });
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      this.logger.warn(`[AUTH] Login failed — wrong password: ${identifier} | IP: ${ip ?? '?'} | UID: ${user.id}`);
      this.securityService.logFailedAuth(ip ?? 'unknown', identifier, userAgent ?? null, 'Invalid password').catch(() => {});
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = this.getUserRoles(user);
    const { accessToken, refreshToken } = await this.generateTokenPair(user, roles);

    this.logger.log(`[AUTH] Login success: ${user.email} | IP: ${ip ?? '?'} | Roles: ${roles.join(',')} | UID: ${user.id}`);
    this.logAuth(SecurityEventType.LOGIN_SUCCESS, { ip, userAgent, userId: user.id, identifier });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  // ─── OTP ─────────────────────────────────────────────────────────────────

  async sendOtp(identifier: string, ip?: string | null, userAgent?: string | null): Promise<{ message: string; code?: string }> {
    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await this.userRepo.findOne({ where: { email: identifier } })
      : await this.userRepo.findOne({ where: { phoneNumber: identifier } });

    if (!user) {
      this.logger.warn(`[AUTH] OTP send — no account: ${identifier} | IP: ${ip ?? '?'}`);
      throw new BadRequestException('No account found with this identifier');
    }

    const code = await this.redisService.generateOtp(identifier);
    const isDev = process.env.NODE_ENV !== 'production';

    this.logger.log(`[AUTH] OTP sent to ${identifier} | IP: ${ip ?? '?'}`);
    this.logAuth(SecurityEventType.OTP_REQUESTED, { ip, userAgent, identifier, userId: user.id });

    if (isDev) {
      console.log(`[OTP] Dev mode — OTP for ${identifier}: ${code}`);
      return {
        message: `OTP sent to ${isEmail ? 'email' : 'phone'} (dev mode — code shown)`,
        code,
      };
    }

    return { message: `OTP sent to ${isEmail ? 'email' : 'phone'}` };
  }

  async verifyOtp(identifier: string, code: string, ip?: string | null, userAgent?: string | null) {
    const valid = await this.redisService.validateOtp(identifier, code);
    if (!valid) {
      this.logger.warn(`[AUTH] OTP verify failed: ${identifier} | IP: ${ip ?? '?'}`);
      this.logAuth(SecurityEventType.OTP_VERIFY_FAILED, { ip, userAgent, identifier, reason: 'Invalid or expired OTP' });
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await this.userRepo.findOne({ where: { email: identifier } })
      : await this.userRepo.findOne({ where: { phoneNumber: identifier } });

    if (!user) {
      throw new UnauthorizedException('Account not found');
    }

    const roles = this.getUserRoles(user);
    const { accessToken, refreshToken } = await this.generateTokenPair(user, roles);

    this.logger.log(`[AUTH] OTP verify success: ${identifier} | IP: ${ip ?? '?'}`);
    this.logAuth(SecurityEventType.OTP_VERIFY_SUCCESS, { ip, userAgent, userId: user.id, identifier });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  // ─── Refresh Token ─────────────────────────────────────────────────────────

  async refreshAccessToken(refreshToken: string, ip?: string | null, userAgent?: string | null): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = await this.hashToken(refreshToken);
    const stored = await this.refreshTokenRepo.findOne({
      where: { tokenHash, isRevoked: false },
      relations: ['user'],
    });

    if (!stored) {
      this.logger.warn(`[AUTH] Token refresh failed — invalid token | IP: ${ip ?? '?'}`);
      this.logAuth(SecurityEventType.TOKEN_REFRESH_FAILED, { ip, userAgent, reason: 'Invalid refresh token' });
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiresAt < new Date()) {
      this.logger.warn(`[AUTH] Token refresh failed — expired | IP: ${ip ?? '?'}`);
      this.logAuth(SecurityEventType.TOKEN_REFRESH_FAILED, { ip, userAgent, userId: stored.userId, reason: 'Refresh token expired' });
      throw new UnauthorizedException('Refresh token expired');
    }

    stored.isRevoked = true;
    await this.refreshTokenRepo.save(stored);

    const roles = this.getUserRoles(stored.user);
    const result = await this.generateTokenPair(stored.user, roles, stored.tokenHash);

    this.logger.log(`[AUTH] Token refreshed: UID ${stored.userId} | IP: ${ip ?? '?'}`);
    this.logAuth(SecurityEventType.TOKEN_REFRESH, { ip, userAgent, userId: stored.userId });

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  async logout(jti: string, exp: number, userId?: string | null, ip?: string | null, userAgent?: string | null) {
    const remainingSeconds = exp - Math.floor(Date.now() / 1000);
    if (remainingSeconds > 0) {
      await this.redisService.blacklistToken(jti, remainingSeconds);
    }
    this.logger.log(`[AUTH] Logout: UID ${userId ?? '?'} | IP: ${ip ?? '?'}`);
    this.logAuth(SecurityEventType.LOGOUT, { ip, userAgent, userId });
    return { message: 'Successfully logged out' };
  }

  // ─── PIN ───────────────────────────────────────────────────────────────────

  async verifyPin(userId: string, dto: PinDto, ip?: string | null, userAgent?: string | null) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.pinHash) {
      throw new BadRequestException('PIN not set. Please set a PIN first.');
    }

    const valid = await bcrypt.compare(dto.pin, user.pinHash);
    if (!valid) {
      this.logger.warn(`[AUTH] PIN verify failed: UID ${userId} | IP: ${ip ?? '?'}`);
      this.logAuth(SecurityEventType.PIN_VERIFY_FAILED, { ip, userAgent, userId, reason: 'Invalid PIN' });
      throw new UnauthorizedException('Invalid PIN');
    }

    this.logger.log(`[AUTH] PIN verified: UID ${userId} | IP: ${ip ?? '?'}`);
    this.logAuth(SecurityEventType.PIN_VERIFY_SUCCESS, { ip, userAgent, userId });
    return { verified: true };
  }

  async updatePin(userId: string, dto: PinUpdateDto, ip?: string | null, userAgent?: string | null) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    if (user.pinHash) {
      const valid = await bcrypt.compare(dto.oldPin, user.pinHash);
      if (!valid) {
        this.logger.warn(`[AUTH] PIN update failed — wrong old PIN: UID ${userId} | IP: ${ip ?? '?'}`);
        this.logAuth(SecurityEventType.PIN_UPDATE, { ip, userAgent, userId, suspicious: true, reason: 'Wrong old PIN' });
        throw new UnauthorizedException('Current PIN is incorrect');
      }
    }

    user.pinHash = await bcrypt.hash(dto.newPin, 10);
    await this.userRepo.save(user);

    this.logger.log(`[AUTH] PIN updated: UID ${userId} | IP: ${ip ?? '?'}`);
    this.logAuth(SecurityEventType.PIN_UPDATE, { ip, userAgent, userId });
    return { message: 'PIN updated successfully' };
  }

  // ─── Token Helpers ─────────────────────────────────────────────────────────

  private async generateTokenPair(
    user: User,
    roles: string[],
    familyHash?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const jti = crypto.randomUUID();
    const accessPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      roles,
      jti,
    };
    const accessExpiry = this.configService.get('jwtAccessExpiry') as string;
    const refreshExpiry = this.configService.get('jwtRefreshExpiry') as string;
    const accessToken = this.jwtService.sign(accessPayload, { expiresIn: accessExpiry as any });

    const tokenString = crypto.randomBytes(48).toString('base64url');
    const tokenHash = await this.hashToken(tokenString);
    const expiresAt = new Date(Date.now() + this.parseExpiry(refreshExpiry));

    const refreshTokenEntity = this.refreshTokenRepo.create({
      userId: user.id,
      tokenHash,
      jti,
      expiresAt,
      isRevoked: false,
    });
    await this.refreshTokenRepo.save(refreshTokenEntity);

    return { accessToken, refreshToken: tokenString };
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 6);
  }

  private async generateToken(user: User, roles: string[]): Promise<string> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      roles,
      jti: crypto.randomUUID(),
    };
    return this.jwtService.sign(payload, { expiresIn: this.configService.get('jwtAccessExpiry') as any });
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const [, value, unit] = match;
    const n = Number(value);
    switch (unit) {
      case 's': return n * 1000;
      case 'm': return n * 60 * 1000;
      case 'h': return n * 60 * 60 * 1000;
      case 'd': return n * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }

  private getUserRoles(user: User): string[] {
    const roles: string[] = [];
    if (user.isAdmin) roles.push('admin');
    if (user.isFarmer) roles.push('farmer');
    if (user.isAgricEnterprise) roles.push('agric_enterprise');
    if (user.isFarmCustomer) roles.push('buyer');
    return roles;
  }

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash, pinHash, deletedAt, ...safe } = user;
    return safe;
  }
}