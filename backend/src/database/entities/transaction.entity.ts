import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { RecurrenceFrequency, TransactionStatus, TransactionType } from '@/common/enums';
import { Household } from './household.entity';
import { User } from './user.entity';
import { BankAccount } from './bank-account.entity';
import { CreditCard } from './credit-card.entity';
import { Category } from './category.entity';
import { TransactionSplit } from './transaction-split.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Index()
  @Column({ name: 'household_id' })
  householdId: string;

  @ManyToOne(() => Household, (household) => household.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'household_id' })
  household: Household;

  @Column({ name: 'payer_id' })
  payerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payer_id' })
  payer: User;

  @Column({ name: 'bank_account_id', nullable: true })
  bankAccountId?: string;

  @ManyToOne(() => BankAccount, (account) => account.transactions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount?: BankAccount;

  @Column({ name: 'credit_card_id', nullable: true })
  creditCardId?: string;

  @ManyToOne(() => CreditCard, (card) => card.transactions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'credit_card_id' })
  creditCard?: CreditCard;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.transactions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({ nullable: true })
  notes?: string;

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Column({ default: false, name: 'is_recurring' })
  isRecurring: boolean;

  @Column({
    type: 'enum',
    enum: RecurrenceFrequency,
    default: RecurrenceFrequency.NONE,
    name: 'recurrence_frequency',
  })
  recurrenceFrequency: RecurrenceFrequency;

  @Column({ type: 'date', nullable: true, name: 'recurrence_end_date' })
  recurrenceEndDate?: string;

  @Column({ name: 'parent_transaction_id', nullable: true })
  parentTransactionId?: string;

  @Column({ default: false, name: 'is_shared' })
  isShared: boolean;

  @Column('simple-array', { nullable: true })
  attachments?: string[];

  @OneToMany(() => TransactionSplit, (split) => split.transaction, { cascade: true })
  splits: TransactionSplit[];
}
