import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { HouseholdRole } from '@/common/enums';
import { Household } from './household.entity';
import { User } from './user.entity';

@Entity('household_members')
@Unique(['householdId', 'userId'])
export class HouseholdMember extends BaseEntity {
  @Index()
  @Column({ name: 'household_id' })
  householdId: string;

  @ManyToOne(() => Household, (household) => household.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'household_id' })
  household: Household;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.householdMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: HouseholdRole, default: HouseholdRole.MEMBER })
  role: HouseholdRole;

  @Column({ type: 'timestamptz', name: 'joined_at', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;
}
