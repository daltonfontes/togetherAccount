import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from '../queue.constants';
import { EmailProcessor } from './email.processor';
import { EmailQueueService } from './email-queue.service';
import { EmailService } from './email.service';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.EMAIL })],
  providers: [EmailProcessor, EmailQueueService, EmailService],
  exports: [EmailQueueService],
})
export class EmailModule {}
