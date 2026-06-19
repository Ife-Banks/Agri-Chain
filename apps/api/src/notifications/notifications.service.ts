import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<Notification> {
    const notification = this.notificationRepo.create(data);
    return this.notificationRepo.save(notification);
  }

  async findAllForUser(
    userId: string,
    opts: { page?: number; limit?: number; unreadOnly?: boolean } = {},
  ): Promise<{ data: Notification[]; total: number; unread: number }> {
    const { page = 1, limit = 20, unreadOnly = false } = opts;

    const baseWhere = { userId };
    const where = unreadOnly ? { ...baseWhere, read: false } : baseWhere;

    const [data, total] = await this.notificationRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadResult = await this.notificationRepo.findAndCount({
      where: { ...baseWhere, read: false },
    });
    const unread = unreadResult[1];

    return { data, total, unread };
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    notification.read = true;
    return this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepo.update(
      { userId, read: false },
      { read: true },
    );
    return { updated: result.affected ?? 0 };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.notificationRepo.findAndCount({
      where: { userId, read: false },
    });
    return result[1];
  }

  async deleteOldRead(daysOld = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    const result = await this.notificationRepo
      .createQueryBuilder('n')
      .where('n.read = :read', { read: true })
      .andWhere('n.createdAt < :cutoff', { cutoff })
      .delete()
      .execute();
    return result.affected ?? 0;
  }

  async broadcast(data: {
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<{ sent: number; failed: number }> {
    const users = await this.userRepo.find({ select: ['id'] });
    const notifications = users.map((u) =>
      this.notificationRepo.create({
        userId: u.id,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data,
      }),
    );
    await this.notificationRepo.save(notifications);
    return { sent: notifications.length, failed: 0 };
  }
}