import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { cleanDatabase, createTestApp } from './utils/test-app';
import { registerUser } from './utils/auth';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('creates a new account and returns a token pair', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'jane@example.com', password: 'S3cure!Passw0rd', fullName: 'Jane Doe' })
        .expect(201);

      expect(response.body.data).toMatchObject({
        user: { email: 'jane@example.com', fullName: 'Jane Doe' },
      });
      expect(response.body.data.accessToken).toEqual(expect.any(String));
      expect(response.body.data.refreshToken).toEqual(expect.any(String));
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('rejects a duplicate email with 409', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'jane@example.com', password: 'S3cure!Passw0rd', fullName: 'Jane Two' })
        .expect(409);
    });

    it('rejects a weak password with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'weak@example.com', password: 'weakpassword', fullName: 'Weak Pw' })
        .expect(400);
    });

    it('rejects unknown fields due to whitelist validation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'extra@example.com',
          password: 'S3cure!Passw0rd',
          fullName: 'Extra Field',
          isAdmin: true,
        })
        .expect(400);

      expect(response.body.message.join(' ')).toContain('isAdmin');
    });
  });

  describe('POST /auth/login', () => {
    it('authenticates with valid credentials', async () => {
      await registerUser(app, { email: 'login@example.com', password: 'S3cure!Passw0rd' });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'login@example.com', password: 'S3cure!Passw0rd' })
        .expect(200);

      expect(response.body.data.user.email).toBe('login@example.com');
    });

    it('rejects an unknown email with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'S3cure!Passw0rd' })
        .expect(401);
    });

    it('rejects an invalid password with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'login@example.com', password: 'WrongPassw0rd!' })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('exchanges a valid refresh token for a new token pair', async () => {
      const user = await registerUser(app, { email: 'refresh@example.com' });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: user.refreshToken })
        .expect(200);

      expect(response.body.data.accessToken).toEqual(expect.any(String));
      expect(response.body.data.refreshToken).not.toBe(user.refreshToken);
    });

    it('rejects reuse of an already-rotated refresh token', async () => {
      const user = await registerUser(app, { email: 'reuse@example.com' });

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: user.refreshToken })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: user.refreshToken })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/auth/logout').expect(401);
    });

    it('revokes the refresh token session', async () => {
      const user = await registerUser(app, { email: 'logout@example.com' });

      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: user.refreshToken })
        .expect(401);
    });
  });

  describe('GET /auth/google', () => {
    it('responds 503 instead of crashing when Google sign-in is not configured', async () => {
      // .env.test intentionally has no GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL —
      // this is also true of any Dokploy deploy that hasn't set them, so the
      // whole app booting at all (see beforeAll) already covers the "does not
      // crash on startup" half of this; this covers the request-time half.
      const response = await request(app.getHttpServer()).get('/api/v1/auth/google').expect(503);
      expect(response.body.message).toMatch(/not configured/i);

      await request(app.getHttpServer()).get('/api/v1/auth/google/callback').expect(503);
    });
  });
});
