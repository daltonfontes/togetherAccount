import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { GoalStatus } from '@/common/enums';
import { Household } from './household.entity';
import { GoalContribution } from './goal-contribution.entity';

@Entity('goals')
export class Goal extends BaseEntity {
  @Index()
  @Column({ name: 'household_id' })
  householdId: string;

  @ManyToOne(() => Household, (household) => household.goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'household_id' })
  household: Household;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'target_amount' })
  targetAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0, name: 'current_amount' })
  currentAmount: number;

  @Column({ type: 'date', nullable: true })
  deadline?: string;

  @Column({ default: '#22c55e' })
  color: string;

  @Column({ default: 'target' })
  icon: string;

  @Column({ type: 'enum', enum: GoalStatus, default: GoalStatus.IN_PROGRESS })
  status: GoalStatus;

  @OneToMany(() => GoalContribution, (contribution) => contribution.goal, { cascade: true })
  contributions: GoalContribution[];
}
