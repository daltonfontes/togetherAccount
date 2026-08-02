import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccount } from '@/database/entities/bank-account.entity';
import { HouseholdsModule } from '@/modules/households/households.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsService } from './bank-accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount]), HouseholdsModule, AuditModule],
  controllers: [BankAccountsController],
  providers: [BankAccountsService],
  exports: [BankAccountsService],
})
export class BankAccountsModule {}
