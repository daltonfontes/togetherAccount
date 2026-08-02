import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '@/database/entities/transaction.entity';
import { BankAccount } from '@/database/entities/bank-account.entity';
import { CreditCard } from '@/database/entities/credit-card.entity';
import { Goal } from '@/database/entities/goal.entity';
import { Budget } from '@/database/entities/budget.entity';
import { HouseholdsModule } from '@/modules/households/households.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, BankAccount, CreditCard, Goal, Budget]),
    HouseholdsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
