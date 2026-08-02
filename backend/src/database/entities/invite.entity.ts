import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { InviteStatus, HouseholdRole } from '@/common/enums';
import { Household } from './household.entity';
import { User } from './user.entity';

@Entity('invites')
export class Invite extends BaseEntity {
  @Index()
  @Column({ name: 'household_id' })
  householdId: string;

  @ManyToOne(() => Household, (household) => household.invites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'household_id' })
  household: Household;

  @Index()
  @Column()
  email: string;

  @Index({ unique: true })
  @Column()
  token: string;

  @Column({ type: 'enum', enum: HouseholdRole, default: HouseholdRole.MEMBER })
  role: HouseholdRole;

  @Column({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING })
  status: InviteStatus;

  @Column({ name: 'invited_by' })
  invitedBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by' })
  inviter: User;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;
}
