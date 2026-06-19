import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PriceAlert } from '../markets/entities/price-alert.entity';
import { Notification, NotificationType } from '../notifications/entities/notification.entity';
import { QrToken } from '../wallet/entities/qr-token.entity';
import { CommodityPrice } from '../markets/entities/commodity-price.entity';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(PriceAlert)
    private readonly alertRepo: Repository<PriceAlert>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(QrToken)
    private readonly qrTokenRepo: Repository<QrToken>,
    @InjectRepository(CommodityPrice)
    private readonly priceRepo: Repository<CommodityPrice>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkPriceAlerts() {
    try {
      const activeAlerts = await this.alertRepo.find({ where: { isActive: true } });

      for (const alert of activeAlerts) {
        const latestPrice = await this.priceRepo.findOne({
          where: { commodityId: alert.commodityId },
          order: { recordedAt: 'DESC' },
        });

        if (!latestPrice) continue;

        const currentPrice = Number(latestPrice.price);
        const thresholdPrice = Number(alert.thresholdPrice);
        let triggered = false;

        if (alert.thresholdType === 'ABOVE' && currentPrice >= thresholdPrice) {
          triggered = true;
        } else if (alert.thresholdType === 'BELOW' && currentPrice <= thresholdPrice) {
          triggered = true;
        }

        if (triggered) {
          alert.triggeredAt = new Date();
          alert.isActive = false;
          await this.alertRepo.save(alert);

          const notification = this.notificationRepo.create({
            userId: alert.userId,
            type: NotificationType.PRICE_ALERT,
            title: `Price Alert: ${alert.thresholdType === 'ABOVE' ? '📈' : '📉'} ${currentPrice >= thresholdPrice ? 'Above' : 'Below'} threshold`,
            body: `Your price alert for this commodity has been triggered. Current price: ₦${currentPrice.toLocaleString()}. Your threshold was ₦${thresholdPrice.toLocaleString()}.`,
            data: {
              commodityId: alert.commodityId,
              thresholdType: alert.thresholdType,
              thresholdPrice: thresholdPrice,
              currentPrice,
            },
          });
          await this.notificationRepo.save(notification);
        }
      }
    } catch (err) {
      console.error('[Scheduler] checkPriceAlerts failed:', err instanceof Error ? err.message : err);
    }
  }

  @Cron('0 3 * * *')
  async cleanupOldNotifications() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const result = await this.notificationRepo
        .createQueryBuilder('n')
        .where('n.read = :read', { read: true })
        .andWhere('n.createdAt < :cutoff', { cutoff })
        .delete()
        .execute();

      if (result.affected && result.affected > 0) {
        console.log(`[Scheduler] Cleaned up ${result.affected} old notifications`);
      }
    } catch (err) {
      console.error('[Scheduler] cleanupOldNotifications failed:', err instanceof Error ? err.message : err);
    }
  }

  @Cron('*/15 * * * *')
  async cleanupExpiredQrTokens() {
    try {
      const now = new Date();
      const result = await this.qrTokenRepo
        .createQueryBuilder('q')
        .update(QrToken)
        .set({ usedAt: new Date(0) })
        .where('q.expiresAt < :now', { now })
        .andWhere('q.usedAt IS NULL')
        .execute();

      if (result.affected && result.affected > 0) {
        console.log(`[Scheduler] Removed ${result.affected} expired unused QR tokens`);
      }
    } catch (err) {
      console.error('[Scheduler] cleanupExpiredQrTokens failed:', err instanceof Error ? err.message : err);
    }
  }
}