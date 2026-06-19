import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  Commodity,
  CommodityPrice,
  FarmPosition,
  PriceAlert,
  Watchlist,
  WeatherAlert,
  CommodityCategory,
} from './entities';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(Commodity)
    private readonly commodityRepo: Repository<Commodity>,
    @InjectRepository(CommodityPrice)
    private readonly priceRepo: Repository<CommodityPrice>,
    @InjectRepository(FarmPosition)
    private readonly positionRepo: Repository<FarmPosition>,
    @InjectRepository(PriceAlert)
    private readonly alertRepo: Repository<PriceAlert>,
    @InjectRepository(Watchlist)
    private readonly watchlistRepo: Repository<Watchlist>,
    @InjectRepository(WeatherAlert)
    private readonly weatherRepo: Repository<WeatherAlert>,
  ) {}

  // ─── Commodities ────────────────────────────────────────────────────────

  async createCommodity(data: {
    name: string;
    symbol: string;
    category: CommodityCategory;
    iconUrl?: string;
  }): Promise<Commodity> {
    const existing = await this.commodityRepo.findOne({ where: { symbol: data.symbol } });
    if (existing) throw new BadRequestException(`Commodity symbol "${data.symbol}" already exists`);

    const commodity = this.commodityRepo.create(data);
    return this.commodityRepo.save(commodity);
  }

  async findAllCommodities(search?: string, category?: CommodityCategory): Promise<Commodity[]> {
    const where: FindOptionsWhere<Commodity> = {};
    if (search) where.name = ILike(`%${search}%`);
    if (category) where.category = category;
    return this.commodityRepo.find({ where, order: { name: 'ASC' } });
  }

  async findCommodity(id: string): Promise<Commodity> {
    const commodity = await this.commodityRepo.findOne({
      where: { id },
      relations: ['prices'],
    });
    if (!commodity) throw new NotFoundException(`Commodity with ID ${id} not found`);
    return commodity;
  }

  async findCommodityBySymbol(symbol: string): Promise<Commodity> {
    const commodity = await this.commodityRepo.findOne({ where: { symbol } });
    if (!commodity) throw new NotFoundException(`Commodity "${symbol}" not found`);
    return commodity;
  }

  // ─── Prices ─────────────────────────────────────────────────────────────

  async recordPrice(commodityId: string, price: number): Promise<CommodityPrice> {
    const commodity = await this.commodityRepo.findOne({ where: { id: commodityId } });
    if (!commodity) throw new NotFoundException('Commodity not found');

    const record = this.priceRepo.create({
      commodityId,
      price,
      recordedAt: new Date(),
    });
    return this.priceRepo.save(record);
  }

  async getPriceHistory(
    commodityId: string,
    from?: string,
    to?: string,
  ): Promise<CommodityPrice[]> {
    const where: FindOptionsWhere<CommodityPrice> = { commodityId };
    if (from && to) {
      where.recordedAt = Between(new Date(from), new Date(to));
    } else if (from) {
      where.recordedAt = MoreThanOrEqual(new Date(from));
    } else if (to) {
      where.recordedAt = LessThanOrEqual(new Date(to));
    }
    return this.priceRepo.find({ where, order: { recordedAt: 'ASC' }, take: 500 });
  }

  async getLatestPrices(commodityId: string): Promise<CommodityPrice[]> {
    const commodity = await this.commodityRepo.findOne({ where: { id: commodityId } });
    if (!commodity) throw new NotFoundException('Commodity not found');
    return this.priceRepo.find({
      where: { commodityId },
      order: { recordedAt: 'DESC' },
      take: 30,
    });
  }

  async getLatestPrice(commodityId: string): Promise<CommodityPrice | null> {
    return this.priceRepo.findOne({
      where: { commodityId },
      order: { recordedAt: 'DESC' },
    });
  }

  // ─── Farm Positions ─────────────────────────────────────────────────────

  async openPosition(
    userId: string,
    commodityId: string,
    units: number,
    buyPrice: number,
  ): Promise<FarmPosition> {
    const commodity = await this.commodityRepo.findOne({ where: { id: commodityId } });
    if (!commodity) throw new NotFoundException('Commodity not found');

    const existing = await this.positionRepo.findOne({
      where: { userId, commodityId },
    });

    if (existing) {
      const totalUnits = Number(existing.unitsHeld) + units;
      const totalCost =
        Number(existing.unitsHeld) * Number(existing.avgBuyPrice) + units * buyPrice;
      existing.unitsHeld = totalUnits;
      existing.avgBuyPrice = totalCost / totalUnits;
      existing.openedAt = new Date();
      return this.positionRepo.save(existing);
    }

    const position = this.positionRepo.create({
      userId,
      commodityId,
      unitsHeld: units,
      avgBuyPrice: buyPrice,
      openedAt: new Date(),
    });
    return this.positionRepo.save(position);
  }

  async getUserPositions(userId: string): Promise<FarmPosition[]> {
    return this.positionRepo.find({
      where: { userId },
      relations: ['commodity'],
      order: { openedAt: 'DESC' },
    });
  }

  async getPosition(userId: string, commodityId: string): Promise<FarmPosition> {
    const position = await this.positionRepo.findOne({
      where: { userId, commodityId },
      relations: ['commodity'],
    });
    if (!position) throw new NotFoundException('No position found for this commodity');
    return position;
  }

  async closePosition(userId: string, commodityId: string): Promise<void> {
    const position = await this.positionRepo.findOne({ where: { userId, commodityId } });
    if (!position) throw new NotFoundException('Position not found');
    await this.positionRepo.remove(position);
  }

  // ─── Price Alerts ────────────────────────────────────────────────────────

  async createAlert(
    userId: string,
    commodityId: string,
    thresholdType: 'ABOVE' | 'BELOW',
    thresholdPrice: number,
  ): Promise<PriceAlert> {
    const commodity = await this.commodityRepo.findOne({ where: { id: commodityId } });
    if (!commodity) throw new NotFoundException('Commodity not found');

    const alert = this.alertRepo.create({
      userId,
      commodityId,
      thresholdType,
      thresholdPrice,
      isActive: true,
    });
    return this.alertRepo.save(alert);
  }

  async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    return this.alertRepo.find({
      where: { userId },
      relations: ['commodity'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteAlert(alertId: string, userId: string): Promise<void> {
    const alert = await this.alertRepo.findOne({ where: { id: alertId, userId } });
    if (!alert) throw new NotFoundException('Alert not found');
    await this.alertRepo.remove(alert);
  }

  async triggerAlerts(commodityId: string, currentPrice: number): Promise<PriceAlert[]> {
    const alerts = await this.alertRepo.find({
      where: { commodityId, isActive: true },
    });

    const toTrigger = alerts.filter(a => {
      if (a.thresholdType === 'ABOVE' && currentPrice >= Number(a.thresholdPrice)) return true;
      if (a.thresholdType === 'BELOW' && currentPrice <= Number(a.thresholdPrice)) return true;
      return false;
    });

    for (const alert of toTrigger) {
      alert.triggeredAt = new Date();
      alert.isActive = false;
    }

    if (toTrigger.length > 0) {
      await this.alertRepo.save(toTrigger);
    }
    return toTrigger;
  }

  // ─── Watchlist ───────────────────────────────────────────────────────────

  async addToWatchlist(userId: string, commodityId: string): Promise<Watchlist> {
    const commodity = await this.commodityRepo.findOne({ where: { id: commodityId } });
    if (!commodity) throw new NotFoundException('Commodity not found');

    const existing = await this.watchlistRepo.findOne({
      where: { userId, commodityId },
    });
    if (existing) return existing;

    const entry = this.watchlistRepo.create({ userId, commodityId, addedAt: new Date() });
    return this.watchlistRepo.save(entry);
  }

  async getWatchlist(userId: string): Promise<Watchlist[]> {
    return this.watchlistRepo.find({
      where: { userId },
      relations: ['commodity'],
      order: { addedAt: 'DESC' },
    });
  }

  async removeFromWatchlist(userId: string, commodityId: string): Promise<void> {
    const entry = await this.watchlistRepo.findOne({ where: { userId, commodityId } });
    if (!entry) throw new NotFoundException('Not in watchlist');
    await this.watchlistRepo.remove(entry);
  }

  // ─── Weather Alerts ─────────────────────────────────────────────────────

  async createWeatherAlert(data: {
    state: string;
    severity: string;
    message: string;
    validFrom: Date;
    validTo: Date;
  }): Promise<WeatherAlert> {
    const alert = this.weatherRepo.create(data);
    return this.weatherRepo.save(alert);
  }

  async getWeatherAlerts(state?: string): Promise<WeatherAlert[]> {
    const where: FindOptionsWhere<WeatherAlert> = {};
    if (state) where.state = state;
    const now = new Date();
    return this.weatherRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }
}