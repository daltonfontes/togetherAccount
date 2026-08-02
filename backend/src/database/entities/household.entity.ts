import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { HouseholdMember } from './household-member.entity';
import { Invite } from './invite.entity';
import { BankAccount } from './bank-account.entity';
import { CreditCard } from './credit-card.entity';
import { Category } from './category.entity';
import { Transaction } from './transaction.entity';
import { Budget } from './budget.entity';
import { Goal } from './goal.entity';
import { AuditLog } from './audit-log.entity';

@Entity('households')
export class Household extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Index({ unique: true })
  @Column({ name: 'invite_code' })
  inviteCode: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ default: 'BRL' })
  currency: string;

  @OneToMany(() => HouseholdMember, (member) => member.household)
  members: HouseholdMember[];

  @OneToMany(() => Invite, (invite) => invite.household)
  invites: Invite[];

  @OneToMany(() => BankAccount, (account) => account.household)
  bankAccounts: BankAccount[];

  @OneToMany(() => CreditCard, (card) => card.household)
  creditCards: CreditCard[];

  @OneToMany(() => Category, (category) => category.household)
  categories: Category[];

  @OneToMany(() => Transaction, (transaction) => transaction.household)
  transactions: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.household)
  budgets: Budget[];

  @OneToMany(() => Goal, (goal) => goal.household)
  goals: Goal[];

  @OneToMany(() => AuditLog, (log) => log.household)
  auditLogs: AuditLog[];
}
