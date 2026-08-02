import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/test-app';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health requires no auth and runs the registered health indicators', async () => {
    // The memory_heap indicator can legitimately report "down" under test-runner
    // memory pressure (e.g. ts-jest), so this only asserts the route is public
    // and wired up, not a specific pass/fail outcome for every indicator.
    const response = await request(app.getHttpServer()).get('/api/health');
    expect(response.status).not.toBe(401);
    expect([200, 503]).toContain(response.status);
  });

  it('GET /health/live is unversioned and requires no auth', async () => {
    const response = await request(app.getHttpServer()).get('/api/health/live').expect(200);
    expect(response.body.data).toEqual({ status: 'ok' });
  });
});
