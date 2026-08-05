import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';
import { SendInviteEmailJob, SendMagicLinkEmailJob } from './email.processor';

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue) {}

  async queueInviteEmail(data: SendInviteEmailJob): Promise<void> {
    await this.emailQueue.add(JOB_NAMES.SEND_INVITE_EMAIL, data);
  }

  async queueMagicLinkEmail(data: SendMagicLinkEmailJob): Promise<void> {
    await this.emailQueue.add(JOB_NAMES.SEND_MAGIC_LINK_EMAIL, data);
  }
}
