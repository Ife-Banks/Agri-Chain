import { Controller, Get, Post, Param, Ip, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AbuseProtectionService } from './abuse-protection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Abuse')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('abuse')
export class AbuseController {
  constructor(private readonly abuseService: AbuseProtectionService) {}

  @Get('stats')
  @Roles('admin')
  @ApiOperation({ summary: 'Get global abuse statistics (admin only)' })
  async getStats() {
    const stats = await this.abuseService.getStats();
    return {
      ...stats,
      loginMaxAttempts: this.abuseService.getLoginWindowSecs(),
      registerMaxFromIp: this.abuseService.getRegisterMaxFromIp(),
    };
  }

  @Get('ip/:ip')
  @Roles('admin')
  @ApiOperation({ summary: 'Get abuse details for a specific IP (admin only)' })
  async getIpDetails(@Param('ip') ip: string) {
    const login = await this.abuseService.getLoginAttempts(ip);
    return {
      ip,
      loginAttempts: login.attempts,
      loginBlocked: login.attempts >= this.abuseService.getLoginWindowSecs(),
      retryAfterSecs: login.retryAfterSecs,
    };
  }

  @Post('clear/:ip')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all abuse blocks for an IP (admin only)' })
  async clearIp(@Param('ip') ip: string) {
    await this.abuseService.clearIpBlocks(ip);
    return { message: `Blocks cleared for IP ${ip}` };
  }
}