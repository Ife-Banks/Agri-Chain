import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketsService } from './markets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CommodityCategory } from './entities/commodity-category.enum';

@ApiTags('Markets')
@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  // ─── Commodities ──────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Post('commodities')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a commodity (admin only)' })
  async createCommodity(@Body() body: {
    name: string;
    symbol: string;
    category: CommodityCategory;
    iconUrl?: string;
  }) {
    return this.marketsService.createCommodity(body);
  }

  @Public()
  @Get('commodities')
  @ApiOperation({ summary: 'List all commodities with optional search' })
  async listCommodities(
    @Query('search') search?: string,
    @Query('category') category?: CommodityCategory,
  ) {
    return this.marketsService.findAllCommodities(search, category);
  }

  @Public()
  @Get('commodities/symbol/:symbol')
  @ApiOperation({ summary: 'Get commodity by symbol' })
  async getBySymbol(@Param('symbol') symbol: string) {
    return this.marketsService.findCommodityBySymbol(symbol);
  }

  @Public()
  @Get('commodities/:id')
  @ApiOperation({ summary: 'Get commodity by ID' })
  async getCommodity(@Param('id') id: string) {
    return this.marketsService.findCommodity(id);
  }

  // ─── Prices ──────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Post('commodities/:id/prices')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a price point for a commodity (admin or price feed)' })
  async recordPrice(@Param('id') id: string, @Body() body: { price: number }) {
    const record = await this.marketsService.recordPrice(id, body.price);
    const triggered = await this.marketsService.triggerAlerts(id, body.price);
    return { record, triggeredAlerts: triggered.length };
  }

  @Public()
  @Get('commodities/:id/prices')
  @ApiOperation({ summary: 'Get latest N price points for a commodity' })
  async getPriceHistory(@Param('id') id: string) {
    return this.marketsService.getLatestPrices(id);
  }

  @Public()
  @Get('commodities/:id/prices/history')
  @ApiOperation({ summary: 'Get price history with optional date range' })
  async getFullHistory(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.marketsService.getPriceHistory(id, from, to);
  }

  // ─── Farm Positions ───────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('positions')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Open or add to a position in a commodity' })
  async openPosition(
    @CurrentUser('sub') userId: string,
    @Body() body: { commodityId: string; units: number; buyPrice: number },
  ) {
    return this.marketsService.openPosition(userId, body.commodityId, body.units, body.buyPrice);
  }

  @UseGuards(JwtAuthGuard)
  @Get('positions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all your farm positions' })
  async getPositions(@CurrentUser('sub') userId: string) {
    return this.marketsService.getUserPositions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('positions/:commodityId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get your position for a specific commodity' })
  async getPosition(
    @CurrentUser('sub') userId: string,
    @Param('commodityId') commodityId: string,
  ) {
    return this.marketsService.getPosition(userId, commodityId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('positions/:commodityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close your position in a commodity' })
  async closePosition(
    @CurrentUser('sub') userId: string,
    @Param('commodityId') commodityId: string,
  ) {
    await this.marketsService.closePosition(userId, commodityId);
  }

  // ─── Price Alerts ─────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('alerts')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a price alert' })
  async createAlert(
    @CurrentUser('sub') userId: string,
    @Body() body: { commodityId: string; thresholdType: 'ABOVE' | 'BELOW'; thresholdPrice: number },
  ) {
    return this.marketsService.createAlert(userId, body.commodityId, body.thresholdType, body.thresholdPrice);
  }

  @UseGuards(JwtAuthGuard)
  @Get('alerts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all your price alerts' })
  async getAlerts(@CurrentUser('sub') userId: string) {
    return this.marketsService.getUserAlerts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('alerts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a price alert' })
  async deleteAlert(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    await this.marketsService.deleteAlert(id, userId);
  }

  // ─── Watchlist ─────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('watchlist/:commodityId')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a commodity to your watchlist' })
  async addToWatchlist(
    @CurrentUser('sub') userId: string,
    @Param('commodityId') commodityId: string,
  ) {
    return this.marketsService.addToWatchlist(userId, commodityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('watchlist')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get your watchlist' })
  async getWatchlist(@CurrentUser('sub') userId: string) {
    return this.marketsService.getWatchlist(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('watchlist/:commodityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a commodity from your watchlist' })
  async removeFromWatchlist(
    @CurrentUser('sub') userId: string,
    @Param('commodityId') commodityId: string,
  ) {
    await this.marketsService.removeFromWatchlist(userId, commodityId);
  }

  // ─── Weather Alerts ────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Post('weather')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a weather alert (admin only)' })
  async createWeatherAlert(@Body() body: {
    state: string;
    severity: string;
    message: string;
    validFrom: Date;
    validTo: Date;
  }) {
    return this.marketsService.createWeatherAlert(body);
  }

  @Public()
  @Get('weather')
  @ApiOperation({ summary: 'Get weather alerts (optionally filter by state)' })
  async getWeatherAlerts(@Query('state') state?: string) {
    return this.marketsService.getWeatherAlerts(state);
  }
}