import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from '../queue.constants';
import { EmailProcessor } from './email.processor';
import { EmailQueueService } from './email-queue.service';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.EMAIL })],
  providers: [EmailProcessor, EmailQueueService],
  exports: [EmailQueueService],
})
export class EmailModule {}
