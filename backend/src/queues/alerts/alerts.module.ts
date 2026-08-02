import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from '@/database/entities/budget.entity';
import { Transaction } from '@/database/entities/transaction.entity';
import { CreditCard } from '@/database/entities/credit-card.entity';
import { HouseholdMember } from '@/database/entities/household-member.entity';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { AlertsScheduler } from './alerts.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget, Transaction, CreditCard, HouseholdMember]),
    NotificationsModule,
  ],
  providers: [AlertsScheduler],
})
export class AlertsModule {}
