import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { RedisService } from '../redis/redis.service';
import { AppConfigService } from '../config/config.service';
import { SecurityService } from '../security/security.service';
import { SecurityEventType } from '../security/entities/security-event.entity';
import {
  generateSecureToken,
  hashToken,
  verifyTokenHash,
  validatePasswordStrength,
  validatePin,
} from '../common/utils/password.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PinDto } from './dto/pin.dto';
import { PinUpdateDto } from './dto/pin-update.dto';
import { JwtPayload } from '../common/decorators/current-user.decorator';
import { EmailVerification } from './entities/email-verification.entity';
import { PasswordReset } from './entities/password-reset.entity';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const EMAIL_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
const PASSWORD_TOKEN_EXPIRY_MS = 60 * 60 * 1000;
const TOKEN_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(EmailVerification)
    private readonly emailVerifRepo: Repository<EmailVerification>,
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: AppConfigService,
    private readonly securityService: SecurityService,
  ) {}

  private async logAuth(
    eventType: SecurityEventType,
    params: {
      ip?: string | null;
      userAgent?: string | null;
      userId?: string | null;
      identifier?: string;
      suspicious?: boolean;
      reason?: string;
      metadata?: Record<string, unknown>;
      attemptCount?: number;
    },
  ) {
    return this.securityService
      .logAuthEvent({
        eventType,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
        userId: params.userId ?? null,
        identifier: params.identifier ?? null,
        suspicious: params.suspicious ?? false,
        reason: params.reason ?? null,
        metadata: params.metadata ?? null,
        attemptCount: params.attemptCount,
      })
      .catch(() => {});
  }

  // ─── Registration ────────────────────────────────────────────────────────

  async register(dto: RegisterDto, ip?: string | null, userAgent?: string | null) {
    const passwordError = validatePasswordStrength(dto.password, dto.username, dto.email);
    if (passwordError) {
      throw new BadRequestException(passwordError);
    }

    const existing = await this.userRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });
    if (existing) {
      this.logger.warn(
        `[AUTH] Register failed — duplicate: ${dto.email} | ${dto.username} | IP: ${ip ?? '?'}`,
      );
      this.logAuth(SecurityEventType.REGISTER_FAILED, {
        ip,
        userAgent,
        identifier: dto.email,
        reason: 'Email or username already in use',
      });
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
      isEmailVerified: false,
      isLocked: false,
      failedLoginAttempts: 0,
    });

    await this.userRepo.save(user);

    const { token, hashedToken } = await this.createEmailVerificationToken(user.id);

    this.logger.log(
      `[AUTH] Registered: ${user.email} (${dto.role}) | IP: ${ip ?? '?'} | UID: ${user.id} | Verification token: ${token}`,
    );
    this.logAuth(SecurityEventType.REGISTER_SUCCESS, {
      ip,
      userAgent,
      userId: user.id,
      identifier: user.email,
      metadata: { emailVerificationToken: token },
    });

    return {
      user: this.sanitizeUser(user),
      message: 'Registration successful. Please check your email to verify your account.',
      emailVerificationToken: token,
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
      this.logAuth(SecurityEventType.LOGIN_FAILED, {
        ip,
        userAgent,
        identifier,
        reason: 'User not found',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isLocked) {
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingMs = user.lockedUntil.getTime() - Date.now();
        const remainingMin = Math.ceil(remainingMs / 60000);
        this.logger.warn(
          `[AUTH] Login blocked — account locked: ${user.email} | IP: ${ip ?? '?'} | Until: ${user.lockedUntil.toISOString()}`,
        );
        this.logAuth(SecurityEventType.ACCOUNT_LOCKED, {
          ip,
          userAgent,
          userId: user.id,
          identifier,
          suspicious: true,
          reason: `Account locked: ${user.lockReason ?? 'Too many failed login attempts'}`,
        });
        throw new ForbiddenException(
          `Account temporarily locked due to too many failed login attempts. Try again in ${remainingMin} minute(s).`,
        );
      }
      user.isLocked = false;
      user.lockedUntil = null;
      user.lockReason = null;
      user.failedLoginAttempts = 0;
      await this.userRepo.save(user);
    }

    if (!user.isEmailVerified) {
      const { token, hashedToken } = await this.createEmailVerificationToken(user.id);
      this.logger.warn(
        `[AUTH] Login blocked — email not verified: ${identifier} | IP: ${ip ?? '?'} | UID: ${user.id}`,
      );
      this.logAuth(SecurityEventType.LOGIN_FAILED, {
        ip,
        userAgent,
        userId: user.id,
        identifier,
        suspicious: true,
        reason: 'Email not verified',
      });
      return {
        needsEmailVerification: true,
        message: 'Please verify your email address first. A new verification link has been sent.',
        emailVerificationToken: token,
      };
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      user.failedLoginAttempts += 1;
      user.lastLoginAt = new Date();

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.isLocked = true;
        user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        user.lockReason = `Too many failed login attempts (${user.failedLoginAttempts}). Locked until ${new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()}`;
        await this.userRepo.save(user);

        this.logger.warn(
          `[AUTH] Account LOCKED after ${MAX_FAILED_ATTEMPTS} failed attempts: ${identifier} | IP: ${ip ?? '?'} | UID: ${user.id}`,
        );
        this.logAuth(SecurityEventType.brute_FORCE_DETECTED, {
          ip,
          userAgent,
          userId: user.id,
          identifier,
          suspicious: true,
          reason: `Account locked after ${MAX_FAILED_ATTEMPTS} failed attempts`,
          attemptCount: user.failedLoginAttempts,
        });
      } else {
        await this.userRepo.save(user);
        this.logger.warn(
          `[AUTH] Login failed — wrong password: ${identifier} | IP: ${ip ?? '?'} | UID: ${user.id} | Attempts: ${user.failedLoginAttempts}/${MAX_FAILED_ATTEMPTS}`,
        );
      }

      this.securityService
        .logFailedAuth(ip ?? 'unknown', identifier, userAgent ?? null, 'Invalid password')
        .catch(() => {});

      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.failedLoginAttempts > 0 || user.isLocked) {
      user.failedLoginAttempts = 0;
      user.isLocked = false;
      user.lockedUntil = null;
      user.lockReason = null;
    }
    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    const roles = this.getUserRoles(user);
    const { accessToken, refreshToken } = await this.generateTokenPair(user, roles);

    this.logger.log(
      `[AUTH] Login success: ${user.email} | IP: ${ip ?? '?'} | Roles: ${roles.join(',')} | UID: ${user.id}`,
    );
    this.logAuth(SecurityEventType.LOGIN_SUCCESS, {
      ip,
      userAgent,
      userId: user.id,
      identifier,
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  // ─── Email Verification ──────────────────────────────────────────────────

  async sendVerificationEmail(userId: string, ip?: string | null, userAgent?: string | null) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (user.isEmailVerified) return { message: 'Email already verified.' };

    const { token, hashedToken } = await this.createEmailVerificationToken(user.id);

    this.logger.log(`[AUTH] Email verification sent: ${user.email} | IP: ${ip ?? '?'} | Token: ${token}`);
    return { message: 'Verification email sent.', emailVerificationToken: token };
  }

  async verifyEmail(userId: string, token: string, ip?: string | null, userAgent?: string | null) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Invalid verification link.');

    if (user.isEmailVerified) {
      return { message: 'Email already verified.', isEmailVerified: true };
    }

    const verif = await this.emailVerifRepo.findOne({
      where: { userId, usedAt: null as any },
      order: { createdAt: 'DESC' },
    });

    if (!verif) {
      throw new UnauthorizedException('Invalid or expired verification link.');
    }

    if (verif.expiresAt < new Date()) {
      throw new UnauthorizedException('Verification link has expired. Please request a new one.');
    }

    const tokenMatch = await verifyTokenHash(token, verif.tokenHash);
    if (!tokenMatch) {
      throw new UnauthorizedException('Invalid verification link.');
    }

    verif.usedAt = new Date();
    await this.emailVerifRepo.save(verif);

    user.isEmailVerified = true;
    await this.userRepo.save(user);

    this.logger.log(`[AUTH] Email verified: ${user.email} | IP: ${ip ?? '?'} | UID: ${user.id}`);
    this.logAuth(SecurityEventType.REGISTER_SUCCESS, {
      ip,
      userAgent,
      userId: user.id,
      identifier: user.email,
      metadata: { emailVerified: true },
    });

    return { message: 'Email verified successfully.', isEmailVerified: true };
  }

  async resendVerification(email: string, ip?: string | null, userAgent?: string | null) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return { message: 'If that email exists, a verification link has been sent.' };

    if (user.isEmailVerified) return { message: 'Email already verified.' };

    const { token } = await this.createEmailVerificationToken(user.id);
    this.logger.log(`[AUTH] Verification email resent: ${email} | IP: ${ip ?? '?'}`);
    return { message: 'Verification email sent.', emailVerificationToken: token };
  }

  private async createEmailVerificationToken(userId: string): Promise<{ token: string; hashedToken: string }> {
    const token = generateSecureToken(32);
    const hashedToken = await hashToken(token, TOKEN_SALT_ROUNDS);

    await this.emailVerifRepo.save(
      this.emailVerifRepo.create({
        userId,
        tokenHash: hashedToken,
        expiresAt: new Date(Date.now() + EMAIL_TOKEN_EXPIRY_MS),
      }),
    );

    return { token, hashedToken };
  }

  // ─── Password Reset ───────────────────────────────────────────────────────

  async forgotPassword(email: string, ip?: string | null, userAgent?: string | null) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`[AUTH] Password reset requested for unknown email: ${email} | IP: ${ip ?? '?'}`);
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const token = generateSecureToken(32);
    const hashedToken = await hashToken(token, TOKEN_SALT_ROUNDS);

    await this.passwordResetRepo.save(
      this.passwordResetRepo.create({
        userId: user.id,
        tokenHash: hashedToken,
        expiresAt: new Date(Date.now() + PASSWORD_TOKEN_EXPIRY_MS),
      }),
    );

    this.logger.log(`[AUTH] Password reset requested: ${email} | IP: ${ip ?? '?'} | UID: ${user.id} | Token: ${token}`);
    this.logAuth(SecurityEventType.OTP_REQUESTED, {
      ip,
      userAgent,
      userId: user.id,
      identifier: email,
      reason: 'Password reset requested',
    });

    return {
      message: 'If that email exists, a reset link has been sent.',
      emailVerificationToken: token,
      userId: user.id,
    };
  }

  async resetPassword(
    userId: string,
    token: string,
    newPassword: string,
    ip?: string | null,
    userAgent?: string | null,
  ) {
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) throw new BadRequestException(passwordError);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Invalid reset link.');

    const reset = await this.passwordResetRepo.findOne({
      where: { userId, usedAt: null as any },
      order: { createdAt: 'DESC' },
    });

    if (!reset) throw new UnauthorizedException('Invalid or expired reset link.');
    if (reset.expiresAt < new Date()) throw new UnauthorizedException('Reset link has expired. Please request a new one.');

    const tokenMatch = await verifyTokenHash(token, reset.tokenHash);
    if (!tokenMatch) {
      this.logger.warn(`[AUTH] Password reset failed — invalid token: UID ${userId} | IP: ${ip ?? '?'}`);
      throw new UnauthorizedException('Invalid reset link.');
    }

    reset.usedAt = new Date();
    await this.passwordResetRepo.save(reset);

    const isCurrentPassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isCurrentPassword) {
      throw new BadRequestException('New password must be different from current password.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockedUntil = null;
    user.lockReason = null;
    await this.userRepo.save(user);

    await this.revokeAllRefreshTokensForUser(user.id);

    this.logger.log(`[AUTH] Password reset completed: ${user.email} | IP: ${ip ?? '?'} | UID: ${user.id}`);
    this.logAuth(SecurityEventType.PIN_UPDATE, {
      ip,
      userAgent,
      userId: user.id,
      reason: 'Password reset completed',
    });

    return { message: 'Password reset successfully. Please log in with your new password.' };
  }

  // ─── Change Password (requires old password) ──────────────────────────────

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ip?: string | null,
    userAgent?: string | null,
  ) {
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) throw new BadRequestException(passwordError);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const isCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPassword) {
      this.logger.warn(`[AUTH] Change password failed — wrong current password: UID ${userId} | IP: ${ip ?? '?'}`);
      this.logAuth(SecurityEventType.PIN_UPDATE, {
        ip,
        userAgent,
        userId,
        suspicious: true,
        reason: 'Wrong current password on change',
      });
      throw new UnauthorizedException('Current password is incorrect.');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from current password.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    await this.revokeAllRefreshTokensForUser(user.id);

    this.logger.log(`[AUTH] Password changed: UID ${userId} | IP: ${ip ?? '?'}`);
    this.logAuth(SecurityEventType.PIN_UPDATE, { ip, userAgent, userId, reason: 'Password changed' });

    return { message: 'Password changed successfully. All other sessions have been logged out.' };
  }

  // ─── OTP ─────────────────────────────────────────────────────────────────

  async sendOtp(identifier: string, ip?: string | null, userAgent?: string | null) {
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
      return { message: `OTP sent (dev mode — code shown)`, code };
    }

    return { message: `OTP sent to ${isEmail ? 'email' : 'phone'}` };
  }

  async verifyOtp(identifier: string, code: string, ip?: string | null, userAgent?: string | null) {
    const valid = await this.redisService.validateOtp(identifier, code);
    if (!valid) {
      this.logger.warn(`[AUTH] OTP verify failed: ${identifier} | IP: ${ip ?? '?'}`);
      this.logAuth(SecurityEventType.OTP_VERIFY_FAILED, {
        ip,
        userAgent,
        identifier,
        reason: 'Invalid or expired OTP',
      });
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await this.userRepo.findOne({ where: { email: identifier } })
      : await this.userRepo.findOne({ where: { phoneNumber: identifier } });

    if (!user) throw new UnauthorizedException('Account not found');

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

  async refreshAccessToken(
    refreshToken: string,
    ip?: string | null,
    userAgent?: string | null,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = await hashToken(refreshToken, 6);
    const stored = await this.refreshTokenRepo.findOne({
      where: { tokenHash, isRevoked: false },
      relations: ['user'],
    });

    if (!stored) {
      this.logger.warn(`[AUTH] Token refresh failed — invalid token | IP: ${ip ?? '?'}`);
      this.logAuth(SecurityEventType.TOKEN_REFRESH_FAILED, {
        ip,
        userAgent,
        reason: 'Invalid refresh token',
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiresAt < new Date()) {
      this.logger.warn(`[AUTH] Token refresh failed — expired | IP: ${ip ?? '?'}`);
      this.logAuth(SecurityEventType.TOKEN_REFRESH_FAILED, {
        ip,
        userAgent,
        userId: stored.userId,
        reason: 'Refresh token expired',
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    stored.isRevoked = true;
    await this.refreshTokenRepo.save(stored);

    const roles = this.getUserRoles(stored.user);
    const result = await this.generateTokenPair(stored.user, roles, stored.tokenHash);

    this.logger.log(`[AUTH] Token refreshed: UID ${stored.userId} | IP: ${ip ?? '?'}`);
    this.logAuth(SecurityEventType.TOKEN_REFRESH, { ip, userAgent, userId: stored.userId });

    return { accessToken: result.accessToken, refreshToken: result.refreshToken };
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  async logout(
    jti: string,
    exp: number,
    userId?: string | null,
    ip?: string | null,
    userAgent?: string | null,
  ) {
    const remainingSeconds = exp - Math.floor(Date.now() / 1000);
    if (remainingSeconds > 0) {
      await this.redisService.blacklistToken(jti, remainingSeconds);
    }
    this.logger.log(`[AUTH] Logout: UID ${userId ?? '?'} | IP: ${ip ?? '?'}`);
    this.logAuth(SecurityEventType.LOGOUT, { ip, userAgent, userId: userId ?? null });
    return { message: 'Successfully logged out' };
  }

  // ─── PIN ───────────────────────────────────────────────────────────────────

  async verifyPin(userId: string, dto: PinDto, ip?: string | null, userAgent?: string | null) {
    const pinError = validatePin(dto.pin);
    if (pinError) throw new BadRequestException(pinError);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.pinHash) throw new BadRequestException('PIN not set. Please set a PIN first.');

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
    const pinError = validatePin(dto.newPin);
    if (pinError) throw new BadRequestException(pinError);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    if (user.pinHash) {
      const valid = await bcrypt.compare(dto.oldPin, user.pinHash);
      if (!valid) {
        this.logger.warn(`[AUTH] PIN update failed — wrong old PIN: UID ${userId} | IP: ${ip ?? '?'}`);
        this.logAuth(SecurityEventType.PIN_UPDATE, {
          ip,
          userAgent,
          userId,
          suspicious: true,
          reason: 'Wrong old PIN',
        });
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
      isEmailVerified: user.isEmailVerified,
    };
    const accessExpiry = this.configService.get('jwtAccessExpiry') as string;
    const refreshExpiry = this.configService.get('jwtRefreshExpiry') as string;
    const accessToken = this.jwtService.sign(accessPayload, { expiresIn: accessExpiry as any });

    const tokenString = crypto.randomBytes(48).toString('base64url');
    const tokenHash = await bcrypt.hash(tokenString, TOKEN_SALT_ROUNDS);
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

  private async revokeAllRefreshTokensForUser(userId: string) {
    await this.refreshTokenRepo.update({ userId, isRevoked: false }, { isRevoked: true });
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
    const {
      passwordHash,
      pinHash,
      deletedAt,
      failedLoginAttempts,
      isLocked,
      lockedUntil,
      lockReason,
      ...safe
    } = user;
    return safe;
  }
}