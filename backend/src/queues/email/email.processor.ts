import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MetricsService } from '@/observability/metrics/metrics.service';
import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';

export interface SendInviteEmailJob {
  to: string;
  householdName: string;
  inviterName: string;
  inviteToken: string;
  frontendUrl: string;
}

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly metricsService: MetricsService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case JOB_NAMES.SEND_INVITE_EMAIL:
        await this.sendInviteEmail(job.data as SendInviteEmailJob);
        break;
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
    this.metricsService.jobsProcessed.inc({ queue: QUEUE_NAMES.EMAIL, status: 'completed' });
  }

  private async sendInviteEmail(data: SendInviteEmailJob): Promise<void> {
    const link = `${data.frontendUrl}/invites/${data.inviteToken}`;
    // NOTE: replace with a real transactional email provider (SES, SendGrid, Postmark...) in production.
    this.logger.log(
      `Sending invite email to ${data.to}: ${data.inviterName} invited you to "${data.householdName}" - ${link}`,
    );
  }
}
