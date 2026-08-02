import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { AuditAction } from '@/common/enums';
import { Household } from './household.entity';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Index()
  @Column({ name: 'household_id', nullable: true })
  householdId?: string;

  @ManyToOne(() => Household, (household) => household.auditLogs, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'household_id' })
  household?: Household;

  @Index()
  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true, name: 'old_value' })
  oldValue?: unknown;

  @Column({ type: 'jsonb', nullable: true, name: 'new_value' })
  newValue?: unknown;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;
}
