import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { AccountType } from '@/common/enums';
import { Household } from './household.entity';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

@Entity('bank_accounts')
export class BankAccount extends BaseEntity {
  @Index()
  @Column({ name: 'household_id' })
  householdId: string;

  @ManyToOne(() => Household, (household) => household.bankAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'household_id' })
  household: Household;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  bank?: string;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.CHECKING })
  type: AccountType;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  balance: number;

  @Column({ default: '#3b82f6' })
  color: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: true, name: 'include_in_total' })
  includeInTotal: boolean;

  @OneToMany(() => Transaction, (transaction) => transaction.bankAccount)
  transactions: Transaction[];
}
