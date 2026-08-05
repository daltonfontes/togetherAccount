import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/config/configuration';
import { EmailService } from './email.service';

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

function buildService(resendApiKey: string | undefined): EmailService {
  const configService = {
    get: jest.fn().mockReturnValue({
      resendApiKey,
      from: 'Together Account <onboarding@resend.dev>',
    }),
  } as unknown as ConfigService<AppConfig>;
  return new EmailService(configService);
}

describe('EmailService', () => {
  beforeEach(() => {
    sendMock.mockReset();
  });

  const params = {
    to: 'jane@example.com',
    subject: 'Hello',
    html: '<p>Hello</p>',
    text: 'Hello',
  };

  it('logs instead of sending when RESEND_API_KEY is not configured', async () => {
    const service = buildService(undefined);

    await service.send(params);

    expect(sendMock).not.toHaveBeenCalled();
  });

  it('sends via Resend with the configured from address when a key is set', async () => {
    sendMock.mockResolvedValue({ data: { id: 'email-1' }, error: null });
    const service = buildService('re_test_key');

    await service.send(params);

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Together Account <onboarding@resend.dev>',
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    );
  });

  it('throws when Resend returns an error, so the BullMQ job can retry', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'invalid_from_address' } });
    const service = buildService('re_test_key');

    await expect(service.send(params)).rejects.toThrow('invalid_from_address');
  });
});
