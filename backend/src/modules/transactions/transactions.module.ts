import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '@/database/entities/transaction.entity';
import { TransactionSplit } from '@/database/entities/transaction-split.entity';
import { Category } from '@/database/entities/category.entity';
import { BankAccount } from '@/database/entities/bank-account.entity';
import { CreditCard } from '@/database/entities/credit-card.entity';
import { HouseholdsModule } from '@/modules/households/households.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionSplit, Category, BankAccount, CreditCard]),
    HouseholdsModule,
    AuditModule,
    NotificationsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
