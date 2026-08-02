import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'crypto';

export interface TestUser {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  password: string;
}

export async function registerUser(
  app: INestApplication,
  overrides: Partial<{ email: string; password: string; fullName: string }> = {},
): Promise<TestUser> {
  const email = overrides.email ?? `user-${randomUUID()}@example.com`;
  const password = overrides.password ?? 'S3cure!Passw0rd';
  const fullName = overrides.fullName ?? 'Test User';

  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({ email, password, fullName })
    .expect(201);

  const body = response.body.data;
  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    userId: body.user.id,
    email,
    password,
  };
}

export async function createHousehold(
  app: INestApplication,
  accessToken: string,
  overrides: Partial<{ name: string; description: string; currency: string }> = {},
): Promise<{ id: string; [key: string]: unknown }> {
  const response = await request(app.getHttpServer())
    .post('/api/v1/households')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name: overrides.name ?? 'Test Household', ...overrides })
    .expect(201);

  return response.body.data;
}
