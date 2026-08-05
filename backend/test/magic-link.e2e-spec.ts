import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '@/app.module';
import { EmailQueueService } from '@/queues/email/email-queue.service';

describe('Magic link auth (e2e)', () => {
  let app: INestApplication;
  // Intercept at the queue boundary instead of letting a real email go out:
  // the emailed link (and thus the raw token) is otherwise only ever visible
  // to Resend, so this is the only way to exercise the full HTTP round trip.
  const queueMagicLinkEmail = jest.fn().mockResolvedValue(undefined);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailQueueService)
      .useValue({ queueInviteEmail: jest.fn(), queueMagicLinkEmail })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    const dataSource = app.get(DataSource);
    const tables: Array<{ tablename: string }> = await dataSource.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'migrations_history'`,
    );
    if (tables.length > 0) {
      const names = tables.map((t) => `"${t.tablename}"`).join(', ');
      await dataSource.query(`TRUNCATE ${names} RESTART IDENTITY CASCADE`);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  function extractToken(): string {
    const lastCall = queueMagicLinkEmail.mock.calls.at(-1) as [{ link: string }];
    return new URL(lastCall[0].link).searchParams.get('token')!;
  }

  it('always responds 204, whether or not the email has an account', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/magic-link')
      .send({ email: 'nobody-knows@example.com' })
      .expect(204);
  });

  it('logs in and creates an account for a brand-new email', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/magic-link')
      .send({ email: 'newperson@example.com' })
      .expect(204);

    expect(queueMagicLinkEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'newperson@example.com', expiresInMinutes: 15 }),
    );
    const token = extractToken();

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/magic-link/verify')
      .send({ token })
      .expect(200);

    expect(response.body.data.user.email).toBe('newperson@example.com');
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));
  });

  it('logs in an existing user without creating a duplicate account', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'existing@example.com', password: 'S3cure!Passw0rd', fullName: 'Existing' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/magic-link')
      .send({ email: 'existing@example.com' })
      .expect(204);
    const token = extractToken();

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/magic-link/verify')
      .send({ token })
      .expect(200);

    expect(response.body.data.user.fullName).toBe('Existing');
  });

  it('rejects an unknown token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/magic-link/verify')
      .send({ token: 'not-a-real-token' })
      .expect(401);
  });

  it('rejects reusing the same token twice', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/magic-link')
      .send({ email: 'onceonly@example.com' })
      .expect(204);
    const token = extractToken();

    await request(app.getHttpServer())
      .post('/api/v1/auth/magic-link/verify')
      .send({ token })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/auth/magic-link/verify')
      .send({ token })
      .expect(401);
  });
});
