import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { cleanDatabase, createTestApp } from './utils/test-app';
import { createHousehold, registerUser, TestUser } from './utils/auth';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let owner: TestUser;
  let partner: TestUser;
  let householdId: string;
  let bankAccountId: string;
  let incomeCategoryId: string;
  let expenseCategoryId: string;

  beforeAll(async () => {
    app = await createTestApp();
    await cleanDatabase(app);

    owner = await registerUser(app, { email: 'payer@example.com' });
    partner = await registerUser(app, { email: 'partner@example.com' });

    const household = await createHousehold(app, owner.accessToken, { name: 'Casa Financeira' });
    householdId = household.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/invites`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ email: partner.email, role: 'member' })
      .expect(201);

    const myInvites = await request(app.getHttpServer())
      .get('/api/v1/invites/me')
      .set('Authorization', `Bearer ${partner.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/invites/${myInvites.body.data[0].token}/accept`)
      .set('Authorization', `Bearer ${partner.accessToken}`)
      .expect(201);

    const bankAccount = await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/bank-accounts`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Conta Corrente', type: 'checking', balance: 1000 })
      .expect(201);
    bankAccountId = bankAccount.body.data.id;

    const categories = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/categories`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    incomeCategoryId = categories.body.data.find((c: { type: string }) => c.type === 'income').id;
    expenseCategoryId = categories.body.data.find((c: { type: string }) => c.type === 'expense').id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates an income transaction and increases the bank account balance', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/transactions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        type: 'income',
        amount: 500,
        description: 'Salário',
        date: '2026-08-01',
        categoryId: incomeCategoryId,
        bankAccountId,
      })
      .expect(201);

    const account = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/bank-accounts/${bankAccountId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    expect(Number(account.body.data.balance)).toBe(1500);
  });

  it('creates an expense transaction and decreases the bank account balance', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/transactions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        type: 'expense',
        amount: 200,
        description: 'Supermercado',
        date: '2026-08-02',
        categoryId: expenseCategoryId,
        bankAccountId,
      })
      .expect(201);

    const account = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/bank-accounts/${bankAccountId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    expect(Number(account.body.data.balance)).toBe(1300);
  });

  it('rejects a transaction with a category from another household', async () => {
    const otherOwner = await registerUser(app, { email: 'other-owner@example.com' });
    const otherHousehold = await createHousehold(app, otherOwner.accessToken, {
      name: 'Outra Casa',
    });
    const otherCategories = await request(app.getHttpServer())
      .get(`/api/v1/households/${otherHousehold.id}/categories`)
      .set('Authorization', `Bearer ${otherOwner.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/transactions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        type: 'expense',
        amount: 50,
        description: 'Categoria inválida',
        date: '2026-08-02',
        categoryId: otherCategories.body.data[0].id,
      })
      .expect(400);
  });

  it('splits a shared expense equally and lets the other party settle it', async () => {
    const created = await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/transactions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        type: 'expense',
        amount: 100,
        description: 'Jantar',
        date: '2026-08-03',
        categoryId: expenseCategoryId,
        isShared: true,
        splitMethod: 'equal',
        splits: [{ userId: owner.userId }, { userId: partner.userId }],
      })
      .expect(201);

    expect(created.body.data.splits).toHaveLength(2);
    const partnerSplit = created.body.data.splits.find(
      (s: { userId: string }) => s.userId === partner.userId,
    );
    expect(Number(partnerSplit.amount)).toBe(50);
    expect(partnerSplit.status).toBe('pending');

    const pending = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/transactions/pending-splits`)
      .set('Authorization', `Bearer ${partner.accessToken}`)
      .expect(200);
    expect(pending.body.data.map((s: { id: string }) => s.id)).toContain(partnerSplit.id);

    await request(app.getHttpServer())
      .patch(
        `/api/v1/households/${householdId}/transactions/${created.body.data.id}/splits/${partnerSplit.id}/settle`,
      )
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    const pendingAfter = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/transactions/pending-splits`)
      .set('Authorization', `Bearer ${partner.accessToken}`)
      .expect(200);
    expect(pendingAfter.body.data.map((s: { id: string }) => s.id)).not.toContain(partnerSplit.id);
  });

  it('rejects percentage splits that do not sum to 100', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/transactions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        type: 'expense',
        amount: 100,
        description: 'Split inválido',
        date: '2026-08-03',
        categoryId: expenseCategoryId,
        isShared: true,
        splitMethod: 'percentage',
        splits: [
          { userId: owner.userId, percentage: 40 },
          { userId: partner.userId, percentage: 40 },
        ],
      })
      .expect(400);
  });

  it('reverts the bank account balance when a transaction is deleted', async () => {
    const created = await request(app.getHttpServer())
      .post(`/api/v1/households/${householdId}/transactions`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        type: 'expense',
        amount: 30,
        description: 'A ser removida',
        date: '2026-08-04',
        categoryId: expenseCategoryId,
        bankAccountId,
      })
      .expect(201);

    const before = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/bank-accounts/${bankAccountId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/households/${householdId}/transactions/${created.body.data.id}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    const after = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/bank-accounts/${bankAccountId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    expect(Number(after.body.data.balance)).toBe(Number(before.body.data.balance) + 30);
  });

  it('filters transactions by type', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/households/${householdId}/transactions`)
      .query({ type: 'income' })
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    expect(response.body.data.items.length).toBeGreaterThan(0);
    for (const item of response.body.data.items) {
      expect(item.type).toBe('income');
    }
  });

  describe('monetary value limits', () => {
    // Regression coverage for a real prod incident: a too-large amount used
    // to reach Postgres and crash with a raw 500 "numeric field overflow"
    // instead of a clean 400. See MAX_MONETARY_VALUE.
    it('rejects a transaction amount above the column limit with 400, not 500', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/households/${householdId}/transactions`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({
          type: 'expense',
          amount: 9_999_999_999_999,
          description: 'Valor absurdo',
          date: '2026-08-05',
          categoryId: expenseCategoryId,
        })
        .expect(400);
    });

    it('rejects a bank account balance above the column limit with 400, not 500', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/households/${householdId}/bank-accounts`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ name: 'Conta Estourada', balance: 9_999_999_999_999 })
        .expect(400);
    });

    it('rejects a credit card limit above the column limit with 400, not 500', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/households/${householdId}/credit-cards`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({
          name: 'Cartão Estourado',
          creditLimit: 9_999_999_999_999,
          closingDay: 5,
          dueDay: 15,
        })
        .expect(400);
    });

    it('rejects a split amount above the column limit with 400, not 500', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/households/${householdId}/transactions`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({
          type: 'expense',
          amount: 100,
          description: 'Split absurdo',
          date: '2026-08-05',
          categoryId: expenseCategoryId,
          isShared: true,
          splitMethod: 'fixed',
          splits: [{ userId: owner.userId, amount: 9_999_999_999_999 }],
        })
        .expect(400);
    });
  });
});
