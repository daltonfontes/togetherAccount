import 'reflect-metadata';
import dataSource from '../data-source';
import { User } from '../entities/user.entity';
import { Household } from '../entities/household.entity';
import { HouseholdMember } from '../entities/household-member.entity';
import { Category } from '../entities/category.entity';
import { HouseholdRole } from '@/common/enums';
import { DEFAULT_CATEGORIES } from './default-categories';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

async function seed() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const householdRepo = dataSource.getRepository(Household);
  const memberRepo = dataSource.getRepository(HouseholdMember);
  const categoryRepo = dataSource.getRepository(Category);

  const existing = await userRepo.findOne({ where: { email: 'demo@togetheraccount.app' } });
  if (existing) {
    console.log('Seed data already exists. Skipping.');
    await dataSource.destroy();
    return;
  }

  const passwordHash = await argon2.hash('Demo@12345');
  const user = await userRepo.save(
    userRepo.create({
      email: 'demo@togetheraccount.app',
      passwordHash,
      fullName: 'Usuário Demonstração',
      emailVerified: true,
    }),
  );

  const household = await householdRepo.save(
    householdRepo.create({
      name: 'Casa Demonstração',
      inviteCode: randomBytes(6).toString('hex'),
      ownerId: user.id,
      currency: 'BRL',
    }),
  );

  await memberRepo.save(
    memberRepo.create({
      householdId: household.id,
      userId: user.id,
      role: HouseholdRole.OWNER,
    }),
  );

  await categoryRepo.save(
    DEFAULT_CATEGORIES.map((category) =>
      categoryRepo.create({ ...category, householdId: household.id, isDefault: true }),
    ),
  );

  console.log('Seed completed:');
  console.log(`  User: demo@togetheraccount.app / Demo@12345`);
  console.log(`  Household: ${household.name} (${household.id})`);

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
