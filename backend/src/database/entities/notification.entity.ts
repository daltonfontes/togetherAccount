import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { NotificationType } from '@/common/enums';
import { User } from './user.entity';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'household_id', nullable: true })
  householdId?: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'read_at' })
  readAt?: Date;
}
