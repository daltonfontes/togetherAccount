import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@/database/entities/notification.entity';
import { NotificationType } from '@/common/enums';
import { PaginatedResultDto, PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export interface CreateNotificationInput {
  userId: string;
  householdId?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification = this.notificationRepository.create(input);
    return this.notificationRepository.save(notification);
  }

  async createMany(inputs: CreateNotificationInput[]): Promise<Notification[]> {
    const notifications = inputs.map((input) => this.notificationRepository.create(input));
    return this.notificationRepository.save(notifications);
  }

  async findForUser(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResultDto<Notification>> {
    const [items, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResultDto(items, total, query.page, query.limit);
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationRepository.count({ where: { userId, isRead: false } });
  }

  async markAsRead(userId: string, id: string): Promise<void> {
    await this.notificationRepository.update(
      { id, userId },
      { isRead: true, readAt: new Date() },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.notificationRepository.delete({ id, userId });
  }
}
