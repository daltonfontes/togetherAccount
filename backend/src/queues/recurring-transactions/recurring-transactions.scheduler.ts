import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';

@Injectable()
export class RecurringTransactionsScheduler {
  private readonly logger = new Logger(RecurringTransactionsScheduler.name);

  constructor(@InjectQueue(QUEUE_NAMES.RECURRING_TRANSACTIONS) private readonly queue: Queue) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async enqueueDailyGeneration(): Promise<void> {
    this.logger.log('Enqueuing daily recurring transaction generation job');
    await this.queue.add(JOB_NAMES.GENERATE_RECURRING, {});
  }
}
