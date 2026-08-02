import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Goal } from './goal.entity';
import { User } from './user.entity';

@Entity('goal_contributions')
export class GoalContribution extends BaseEntity {
  @Index()
  @Column({ name: 'goal_id' })
  goalId: string;

  @ManyToOne(() => Goal, (goal) => goal.contributions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: Goal;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  note?: string;
}
