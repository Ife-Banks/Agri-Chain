import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppConfigService, AppConfig } from './config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: AppConfigService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Get all public config values (no auth required)' })
  async getPublicConfig() {
    return this.configService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all config values (admin only)' })
  async getAll() {
    return this.configService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Put(':key')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a config value (admin only)' })
  async updateConfig(@Param('key') key: string, @Body() body: { value: unknown }) {
    return this.configService.set(key as keyof AppConfig, body.value as never);
  }
}