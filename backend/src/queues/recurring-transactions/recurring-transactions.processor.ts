import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Job } from 'bullmq';
import { Transaction } from '@/database/entities/transaction.entity';
import { BankAccount } from '@/database/entities/bank-account.entity';
import { RecurrenceFrequency, TransactionType } from '@/common/enums';
import { MetricsService } from '@/observability/metrics/metrics.service';
import { QUEUE_NAMES } from '../queue.constants';

@Processor(QUEUE_NAMES.RECURRING_TRANSACTIONS)
export class RecurringTransactionsProcessor extends WorkerHost {
  private readonly logger = new Logger(RecurringTransactionsProcessor.name);

  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(BankAccount) private readonly bankAccountRepository: Repository<BankAccount>,
    private readonly metricsService: MetricsService,
  ) {
    super();
  }

  async process(_job: Job): Promise<void> {
    const roots = await this.transactionRepository.find({
      where: { isRecurring: true, parentTransactionId: IsNull() },
    });

    let generatedCount = 0;
    const today = new Date().toISOString().slice(0, 10);

    for (const root of roots) {
      if (root.recurrenceEndDate && root.recurrenceEndDate < today) {
        continue;
      }

      const lastOccurrence = await this.transactionRepository.findOne({
        where: [{ id: root.id }, { parentTransactionId: root.id }],
        order: { date: 'DESC' },
      });

      const nextDate = this.computeNextDate(
        lastOccurrence?.date ?? root.date,
        root.recurrenceFrequency,
      );

      if (nextDate > today) {
        continue;
      }
      if (root.recurrenceEndDate && nextDate > root.recurrenceEndDate) {
        continue;
      }

      const alreadyExists = await this.transactionRepository.findOne({
        where: { parentTransactionId: root.id, date: nextDate },
      });
      if (alreadyExists) {
        continue;
      }

      const newTransaction = this.transactionRepository.create({
        householdId: root.householdId,
        payerId: root.payerId,
        bankAccountId: root.bankAccountId,
        creditCardId: root.creditCardId,
        categoryId: root.categoryId,
        type: root.type,
        amount: root.amount,
        description: root.description,
        notes: root.notes,
        date: nextDate,
        isRecurring: false,
        recurrenceFrequency: root.recurrenceFrequency,
        parentTransactionId: root.id,
        isShared: root.isShared,
      });
      await this.transactionRepository.save(newTransaction);

      if (root.bankAccountId && !root.creditCardId) {
        const delta = root.type === TransactionType.INCOME ? root.amount : -root.amount;
        await this.bankAccountRepository.increment({ id: root.bankAccountId }, 'balance', delta);
      }

      generatedCount += 1;
    }

    this.logger.log(`Generated ${generatedCount} recurring transaction occurrences`);
    this.metricsService.jobsProcessed.inc({
      queue: QUEUE_NAMES.RECURRING_TRANSACTIONS,
      status: 'completed',
    });
  }

  private computeNextDate(fromDate: string, frequency: RecurrenceFrequency): string {
    const date = new Date(fromDate + 'T00:00:00Z');
    switch (frequency) {
      case RecurrenceFrequency.DAILY:
        date.setUTCDate(date.getUTCDate() + 1);
        break;
      case RecurrenceFrequency.WEEKLY:
        date.setUTCDate(date.getUTCDate() + 7);
        break;
      case RecurrenceFrequency.MONTHLY:
        date.setUTCMonth(date.getUTCMonth() + 1);
        break;
      case RecurrenceFrequency.YEARLY:
        date.setUTCFullYear(date.getUTCFullYear() + 1);
        break;
      default:
        date.setUTCFullYear(date.getUTCFullYear() + 100);
    }
    return date.toISOString().slice(0, 10);
  }
}
