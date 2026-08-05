import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AppConfig } from '@/config/configuration';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend?: Resend;
  private readonly from: string;

  constructor(configService: ConfigService<AppConfig>) {
    const email = configService.get('email', { infer: true })!;
    this.from = email.from;
    this.resend = email.resendApiKey ? new Resend(email.resendApiKey) : undefined;
  }

  async send(params: SendEmailParams): Promise<void> {
    if (!this.resend) {
      this.logger.log(
        `[Resend not configured, email not sent] To: ${params.to} | Subject: ${params.subject}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      // Throw so BullMQ's built-in retry/backoff (see BullMqRootModule) handles
      // transient Resend failures instead of silently dropping the email.
      this.logger.error(`Resend failed to send to ${params.to}: ${error.message}`);
      throw new Error(`Failed to send email via Resend: ${error.message}`);
    }
  }
}
