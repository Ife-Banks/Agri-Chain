import {
  Controller,
  Post,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PinDto } from './dto/pin.dto';
import { PinUpdateDto } from './dto/pin-update.dto';
import { OtpSendDto } from './dto/otp-send.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

function getClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'] as string | undefined;
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress ?? null;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user — sends email verification link' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login — requires email verification, blocked if account is locked' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  @Post('login/pin')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 4-digit PIN for sensitive operations' })
  async verifyPin(@CurrentUser('sub') userId: string, @Body() dto: PinDto, @Req() req: Request) {
    return this.authService.verifyPin(userId, dto, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to email or phone' })
  async sendOtp(@Body() dto: OtpSendDto, @Req() req: Request) {
    const identifier = dto.email || dto.phone;
    if (!identifier) throw new BadRequestException('Email or phone is required');
    return this.authService.sendOtp(identifier, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and receive tokens' })
  async verifyOtp(@Body() dto: OtpVerifyDto, @Req() req: Request) {
    return this.authService.verifyOtp(dto.identifier, dto.otp, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.authService.refreshAccessToken(dto.refreshToken, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate current token (add to Redis blacklist)' })
  async logout(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    return this.authService.logout(user.jti!, user.exp, user.sub, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  @Put('pin')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set or change PIN' })
  async updatePin(@CurrentUser('sub') userId: string, @Body() dto: PinUpdateDto, @Req() req: Request) {
    return this.authService.updatePin(userId, dto, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  // ─── Password Change ───────────────────────────────────────────────────────

  @Put('password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password — requires current password, logs out all other sessions' })
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    return this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
      getClientIp(req),
      req.headers['user-agent'] ?? null,
    );
  }

  // ─── Email Verification ─────────────────────────────────────────────────────

  @Public()
  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address with token from verification link' })
  async verifyEmail(
    @Body() body: { userId: string; token: string },
    @Req() req: Request,
  ) {
    return this.authService.verifyEmail(body.userId, body.token, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  @Public()
  @Post('email/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification link' })
  async resendVerification(@Body() body: { email: string }, @Req() req: Request) {
    return this.authService.resendVerification(body.email, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  @Post('email/send-verification')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send email verification link to authenticated user' })
  async sendVerificationEmail(@CurrentUser('sub') userId: string, @Req() req: Request) {
    return this.authService.sendVerificationEmail(userId, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  // ─── Password Reset ───────────────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link — sent only if email exists (prevents enumeration)' })
  async forgotPassword(@Body() body: { email: string }, @Req() req: Request) {
    return this.authService.forgotPassword(body.email, getClientIp(req), req.headers['user-agent'] ?? null);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email — invalidates all existing sessions' })
  async resetPassword(
    @Body() body: { userId: string; token: string; newPassword: string },
    @Req() req: Request,
  ) {
    return this.authService.resetPassword(
      body.userId,
      body.token,
      body.newPassword,
      getClientIp(req),
      req.headers['user-agent'] ?? null,
    );
  }
}