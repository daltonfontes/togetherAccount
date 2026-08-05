import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { cleanDatabase, createTestApp } from './utils/test-app';
import { createHousehold, registerUser, TestUser } from './utils/auth';

describe('Households (e2e)', () => {
  let app: INestApplication;
  let owner: TestUser;
  let outsider: TestUser;

  beforeAll(async () => {
    app = await createTestApp();
    await cleanDatabase(app);
    owner = await registerUser(app, { email: 'owner@example.com' });
    outsider = await registerUser(app, { email: 'outsider@example.com' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a household, assigns the creator as owner, and seeds default categories', async () => {
    const household = await createHousehold(app, owner.accessToken, { name: 'Casa da Ana' });
    expect(household.name).toBe('Casa da Ana');

    const categories = await request(app.getHttpServer())
      .get(`/api/v1/households/${household.id}/categories`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    expect(categories.body.data.length).toBeGreaterThan(0);

    const members = await request(app.getHttpServer())
      .get(`/api/v1/households/${household.id}/members`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    expect(members.body.data).toHaveLength(1);
    expect(members.body.data[0]).toMatchObject({ userId: owner.userId, role: 'owner' });
  });

  it('lists only the households the current user belongs to', async () => {
    const household = await createHousehold(app, owner.accessToken, { name: 'Casa Isolada' });

    const ownerList = await request(app.getHttpServer())
      .get('/api/v1/households')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    expect(ownerList.body.data.map((h: { id: string }) => h.id)).toContain(household.id);

    const outsiderList = await request(app.getHttpServer())
      .get('/api/v1/households')
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .expect(200);
    expect(outsiderList.body.data.map((h: { id: string }) => h.id)).not.toContain(household.id);
  });

  it('forbids non-members from reading household details', async () => {
    const household = await createHousehold(app, owner.accessToken, { name: 'Casa Privada' });

    await request(app.getHttpServer())
      .get(`/api/v1/households/${household.id}`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .expect(403);
  });

  it('rejects unauthenticated requests', async () => {
    await request(app.getHttpServer()).get('/api/v1/households').expect(401);
  });

  describe('invites', () => {
    it('invites a member, lists the invite for the invitee, and accepts it', async () => {
      const household = await createHousehold(app, owner.accessToken, { name: 'Casa com Convite' });
      const invitee = await registerUser(app, { email: 'invitee@example.com' });

      await request(app.getHttpServer())
        .post(`/api/v1/households/${household.id}/invites`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: invitee.email, role: 'member' })
        .expect(201);

      const myInvites = await request(app.getHttpServer())
        .get('/api/v1/invites/me')
        .set('Authorization', `Bearer ${invitee.accessToken}`)
        .expect(200);
      expect(myInvites.body.data).toHaveLength(1);

      const token: string = myInvites.body.data[0].token;

      await request(app.getHttpServer())
        .post(`/api/v1/invites/${token}/accept`)
        .set('Authorization', `Bearer ${invitee.accessToken}`)
        .expect(201);

      const members = await request(app.getHttpServer())
        .get(`/api/v1/households/${household.id}/members`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .expect(200);
      expect(members.body.data.map((m: { userId: string }) => m.userId)).toContain(invitee.userId);
    });

    it('only owners/admins can invite new members', async () => {
      const household = await createHousehold(app, owner.accessToken, { name: 'Casa Restrita' });

      await request(app.getHttpServer())
        .post(`/api/v1/households/${household.id}/invites`)
        .set('Authorization', `Bearer ${outsider.accessToken}`)
        .send({ email: 'someone@example.com', role: 'member' })
        .expect(403);
    });

    it('rejects a duplicate pending invite for the same email', async () => {
      const household = await createHousehold(app, owner.accessToken, { name: 'Casa Duplicada' });

      await request(app.getHttpServer())
        .post(`/api/v1/households/${household.id}/invites`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: 'dup@example.com', role: 'member' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/households/${household.id}/invites`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: 'dup@example.com', role: 'member' })
        .expect(409);
    });
  });

  describe('member management', () => {
    it('prevents removing the household owner', async () => {
      const household = await createHousehold(app, owner.accessToken, { name: 'Casa do Dono' });

      const members = await request(app.getHttpServer())
        .get(`/api/v1/households/${household.id}/members`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .expect(200);
      const ownerMemberId = members.body.data[0].id;

      await request(app.getHttpServer())
        .delete(`/api/v1/households/${household.id}/members/${ownerMemberId}`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .expect(403);
    });

    it('prevents the owner from leaving their own household', async () => {
      const household = await createHousehold(app, owner.accessToken, { name: 'Casa Permanente' });

      await request(app.getHttpServer())
        .post(`/api/v1/households/${household.id}/leave`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .expect(403);
    });

    it('prevents an admin from demoting the household owner', async () => {
      const household = await createHousehold(app, owner.accessToken, { name: 'Casa com Admin' });
      const admin = await registerUser(app, { email: 'admin-demote@example.com' });

      await request(app.getHttpServer())
        .post(`/api/v1/households/${household.id}/invites`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: admin.email, role: 'admin' })
        .expect(201);
      const invites = await request(app.getHttpServer())
        .get('/api/v1/invites/me')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .post(`/api/v1/invites/${invites.body.data[0].token}/accept`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(201);

      const members = await request(app.getHttpServer())
        .get(`/api/v1/households/${household.id}/members`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .expect(200);
      const ownerMemberId = members.body.data.find(
        (m: { userId: string }) => m.userId === owner.userId,
      ).id;

      // The admin tries to strip the real owner's role — must be rejected,
      // otherwise the owner would be locked out of every owner/admin-gated
      // endpoint on their own household while still technically owning it.
      await request(app.getHttpServer())
        .patch(`/api/v1/households/${household.id}/members/${ownerMemberId}/role`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send({ role: 'member' })
        .expect(403);
    });

    it('prevents granting the owner role through the member-role endpoint', async () => {
      const household = await createHousehold(app, owner.accessToken, { name: 'Casa Sem Golpe' });
      const member = await registerUser(app, { email: 'member-escalate@example.com' });

      await request(app.getHttpServer())
        .post(`/api/v1/households/${household.id}/invites`)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ email: member.email, role: 'admin' })
        .expect(201);
      const invites = await request(app.getHttpServer())
        .get('/api/v1/invites/me')
        .set('Authorization', `Bearer ${member.accessToken}`)
        .expect(200);
      const accepted = await request(app.getHttpServer())
        .post(`/api/v1/invites/${invites.body.data[0].token}/accept`)
        .set('Authorization', `Bearer ${member.accessToken}`)
        .expect(201);
      const memberId = accepted.body.data.id;

      // An admin tries to hand themselves the owner role — must be rejected;
      // ownership is tied to household.ownerId, not this mutable role column.
      await request(app.getHttpServer())
        .patch(`/api/v1/households/${household.id}/members/${memberId}/role`)
        .set('Authorization', `Bearer ${member.accessToken}`)
        .send({ role: 'owner' })
        .expect(403);
    });
  });
});
