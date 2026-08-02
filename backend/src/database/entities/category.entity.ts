import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { TransactionType } from '@/common/enums';
import { Household } from './household.entity';
import { Transaction } from './transaction.entity';
import { Budget } from './budget.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Index()
  @Column({ name: 'household_id' })
  householdId: string;

  @ManyToOne(() => Household, (household) => household.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'household_id' })
  household: Household;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: TransactionType, default: TransactionType.EXPENSE })
  type: TransactionType;

  @Column({ default: 'circle' })
  icon: string;

  @Column({ default: '#64748b' })
  color: string;

  @Column({ default: false, name: 'is_default' })
  isDefault: boolean;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.category)
  budgets: Budget[];
}
