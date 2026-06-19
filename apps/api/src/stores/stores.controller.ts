import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { CreateStoreDto, UpdateStoreDto, StoreQueryDto } from './dto/stores.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  // ─── Public ─────────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active stores (paginated, public)' })
  async findAll(@Query() query: StoreQueryDto) {
    return this.storesService.findAll(query);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a store by slug (public store page)' })
  async findBySlug(@Param('slug') slug: string) {
    return this.storesService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a store by ID (public)' })
  async findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  // ─── Authenticated (Farmer) ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create your store (one per farmer)' })
  async create(
    @CurrentUser('sub') farmerId: string,
    @Body() dto: CreateStoreDto,
  ) {
    return this.storesService.create(farmerId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('farmer/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current user's store" })
  async getMyStore(@CurrentUser('sub') farmerId: string) {
    return this.storesService.findByFarmer(farmerId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your store (or any store if admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.storesService.update(id, dto, user.sub, user.roles);
  }

  // ─── Admin Only ──────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Patch(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle store verification status (admin only)' })
  async toggleVerification(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.storesService.toggleVerification(id, user.roles);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a store (admin only)' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.storesService.remove(id, user.roles);
  }
}