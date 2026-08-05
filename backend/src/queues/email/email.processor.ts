import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MetricsService } from '@/observability/metrics/metrics.service';
import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';
import { EmailService } from './email.service';
import { inviteEmailTemplate } from './templates/invite-email.template';
import { magicLinkEmailTemplate } from './templates/magic-link-email.template';

export interface SendInviteEmailJob {
  to: string;
  householdName: string;
  inviterName: string;
  inviteToken: string;
  frontendUrl: string;
}

export interface SendMagicLinkEmailJob {
  to: string;
  link: string;
  expiresInMinutes: number;
}

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly metricsService: MetricsService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case JOB_NAMES.SEND_INVITE_EMAIL:
        await this.sendInviteEmail(job.data as SendInviteEmailJob);
        break;
      case JOB_NAMES.SEND_MAGIC_LINK_EMAIL:
        await this.sendMagicLinkEmail(job.data as SendMagicLinkEmailJob);
        break;
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
    this.metricsService.jobsProcessed.inc({ queue: QUEUE_NAMES.EMAIL, status: 'completed' });
  }

  private async sendInviteEmail(data: SendInviteEmailJob): Promise<void> {
    const link = `${data.frontendUrl}/invites/${data.inviteToken}`;
    const { subject, html, text } = inviteEmailTemplate({
      householdName: data.householdName,
      inviterName: data.inviterName,
      link,
    });

    await this.emailService.send({ to: data.to, subject, html, text });
  }

  private async sendMagicLinkEmail(data: SendMagicLinkEmailJob): Promise<void> {
    const { subject, html, text } = magicLinkEmailTemplate({
      link: data.link,
      expiresInMinutes: data.expiresInMinutes,
    });

    await this.emailService.send({ to: data.to, subject, html, text });
  }
}
