import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { cleanDatabase, createTestApp } from './utils/test-app';
import { createHousehold, registerUser, TestUser } from './utils/auth';

describe('Goals (e2e)', () => {
  let app: INestApplication;
  let owner: TestUser;
  let householdId: string;
  let goalId: string;

  beforeAll(async () => {
    app = await createTestApp();
    await cleanDatabase(app);

    owner = await registerUser(app, { email: 'goal-owner@example.com' });
    const household = await createHousehold(app, owner.accessToken, { name: 'Casa da Meta' });
    householdId = household.id as string;

    const goal = await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/goals`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Viagem', targetAmount: 100 })
      .expect(201);
    goalId = goal.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('adds a contribution, updating the goal balance without touching other contributions', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/goals/${goalId}/contributions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ amount: 0.18, date: '2026-08-02', note: '' })
      .expect(201);

    expect(Number(response.body.data.currentAmount)).toBeCloseTo(0.18);
    expect(response.body.data.status).toBe('in_progress');
    expect(response.body.data.contributions).toHaveLength(1);
    expect(response.body.data.contributions[0].goalId).toBe(goalId);
  });

  it('marks the goal completed and notifies household members once the target is reached', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/goals/${goalId}/contributions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ amount: 60, date: '2026-08-03' })
      .expect(201);

    const completed = await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/goals/${goalId}/contributions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ amount: 50, date: '2026-08-04' })
      .expect(201);

    expect(Number(completed.body.data.currentAmount)).toBeCloseTo(110.18);
    expect(completed.body.data.status).toBe('completed');
    expect(completed.body.data.contributions).toHaveLength(3);

    const notifications = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    expect(
      notifications.body.data.items.some(
        (n: { type: string; metadata: { goalId?: string } }) =>
          n.type === 'goal_reached' && n.metadata.goalId === goalId,
      ),
    ).toBe(true);
  });

  it('rejects a targetAmount above the column limit with 400, not 500', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/goals`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Meta Absurda', targetAmount: 9_999_999_999_999 })
      .expect(400);
  });

  it('rejects a contribution amount above the column limit with 400, not 500', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/goals/${goalId}/contributions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ amount: 9_999_999_999_999, date: '2026-08-05' })
      .expect(400);
  });
});
