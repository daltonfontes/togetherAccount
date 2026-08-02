import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { cleanDatabase, createTestApp } from './utils/test-app';
import { createHousehold, registerUser, TestUser } from './utils/auth';

describe('Budgets (e2e)', () => {
  let app: INestApplication;
  let owner: TestUser;
  let householdId: string;
  let expenseCategoryId: string;

  beforeAll(async () => {
    app = await createTestApp();
    await cleanDatabase(app);

    owner = await registerUser(app, { email: 'budget-owner@example.com' });
    const household = await createHousehold(app, owner.accessToken, { name: 'Casa Orçamento' });
    householdId = household.id as string;

    const categories = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/categories`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    expenseCategoryId = categories.body.data.find((c: { type: string }) => c.type === 'expense').id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a budget for a category and period', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/budgets`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ categoryId: expenseCategoryId, month: 8, year: 2026, limitAmount: 500 })
      .expect(201);

    expect(Number(response.body.data.limitAmount)).toBe(500);
  });

  it('rejects a duplicate budget for the same category and period', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/budgets`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ categoryId: expenseCategoryId, month: 8, year: 2026, limitAmount: 500 })
      .expect(409);
  });

  it('computes spending progress from transactions in the budget period', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/transactions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        type: 'expense',
        amount: 450,
        description: 'Compra grande',
        date: '2026-08-10',
        categoryId: expenseCategoryId,
      })
      .expect(201);

    const budgets = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/budgets`)
      .query({ month: 8, year: 2026 })
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    const progress = budgets.body.data[0];
    expect(progress.spent).toBe(450);
    expect(progress.remaining).toBe(50);
    expect(progress.isNearLimit).toBe(true);
    expect(progress.isExceeded).toBe(false);
  });

  it('marks the budget as exceeded once spending passes the limit', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/transactions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        type: 'expense',
        amount: 100,
        description: 'Estourou o limite',
        date: '2026-08-15',
        categoryId: expenseCategoryId,
      })
      .expect(201);

    const budgets = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/budgets`)
      .query({ month: 8, year: 2026 })
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    const progress = budgets.body.data[0];
    expect(progress.spent).toBe(550);
    expect(progress.isExceeded).toBe(true);
  });

  it('does not count transactions from other categories or months', async () => {
    const otherCategory = await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/categories`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Lazer', type: 'expense' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/transactions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        type: 'expense',
        amount: 999,
        description: 'Fora do orçamento',
        date: '2026-08-20',
        categoryId: otherCategory.body.data.id,
      })
      .expect(201);

    const budgets = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/budgets`)
      .query({ month: 8, year: 2026 })
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    expect(budgets.body.data).toHaveLength(1);
    expect(budgets.body.data[0].spent).toBe(550);
  });

  it('deletes a budget', async () => {
    const budgets = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/budgets`)
      .query({ month: 8, year: 2026 })
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const budgetId = budgets.body.data[0].budget.id;

    await request(app.getHttpServer())
      .delete(`/api/v1/households/${householdId}/budgets/${budgetId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/budgets/${budgetId}/progress`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(404);
  });
});
