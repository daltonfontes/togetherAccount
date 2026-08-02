import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCard } from '@/database/entities/credit-card.entity';
import { Transaction } from '@/database/entities/transaction.entity';
import { HouseholdsModule } from '@/modules/households/households.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { CreditCardsController } from './credit-cards.controller';
import { CreditCardsService } from './credit-cards.service';

@Module({
  imports: [TypeOrmModule.forFeature([CreditCard, Transaction]), HouseholdsModule, AuditModule],
  controllers: [CreditCardsController],
  providers: [CreditCardsService],
  exports: [CreditCardsService],
})
export class CreditCardsModule {}
