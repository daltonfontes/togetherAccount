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

  it('GET /health requires no auth, runs the registered health indicators, and never hides indicator details behind a generic error message', async () => {
    // The memory_heap indicator can legitimately report "down" under test-runner
    // memory pressure (e.g. ts-jest), so this only asserts the route is public
    // and wired up, not a specific pass/fail outcome for every indicator.
    const response = await request(app.getHttpServer()).get('/api/health');
    expect(response.status).not.toBe(401);
    expect([200, 503]).toContain(response.status);

    // On success the Terminus payload comes back as-is (wrapped by the response
    // interceptor); on failure it must still be reachable via `details`, instead
    // of being swallowed into a generic "Service Unavailable Exception" message.
    const info = response.status === 200 ? response.body.data.info : response.body.details?.info;
    expect(info?.database?.status).toBe('up');
  });

  it('GET /health/live is unversioned and requires no auth', async () => {
    const response = await request(app.getHttpServer()).get('/api/health/live').expect(200);
    expect(response.body.data).toEqual({ status: 'ok' });
  });
});
