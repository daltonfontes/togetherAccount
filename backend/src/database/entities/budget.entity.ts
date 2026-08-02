import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Household } from './household.entity';
import { Category } from './category.entity';

@Entity('budgets')
@Unique(['householdId', 'categoryId', 'month', 'year'])
export class Budget extends BaseEntity {
  @Index()
  @Column({ name: 'household_id' })
  householdId: string;

  @ManyToOne(() => Household, (household) => household.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'household_id' })
  household: Household;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'limit_amount' })
  limitAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 80, name: 'alert_threshold' })
  alertThreshold: number;
}
