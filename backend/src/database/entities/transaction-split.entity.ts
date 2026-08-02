import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { SplitStatus } from '@/common/enums';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

@Entity('transaction_splits')
export class TransactionSplit extends BaseEntity {
  @Index()
  @Column({ name: 'transaction_id' })
  transactionId: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.splits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage?: number;

  @Column({ type: 'enum', enum: SplitStatus, default: SplitStatus.PENDING })
  status: SplitStatus;

  @Column({ type: 'timestamptz', nullable: true, name: 'settled_at' })
  settledAt?: Date;
}
