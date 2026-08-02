import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '@/database/entities/transaction.entity';
import { BankAccount } from '@/database/entities/bank-account.entity';
import { QUEUE_NAMES } from '../queue.constants';
import { RecurringTransactionsScheduler } from './recurring-transactions.scheduler';
import { RecurringTransactionsProcessor } from './recurring-transactions.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, BankAccount]),
    BullModule.registerQueue({ name: QUEUE_NAMES.RECURRING_TRANSACTIONS }),
  ],
  providers: [RecurringTransactionsScheduler, RecurringTransactionsProcessor],
})
export class RecurringTransactionsModule {}
