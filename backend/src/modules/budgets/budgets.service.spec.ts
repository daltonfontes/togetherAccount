import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Budget } from '@/database/entities/budget.entity';
import { Transaction } from '@/database/entities/transaction.entity';
import { BudgetsService } from './budgets.service';

describe('BudgetsService', () => {
  let service: BudgetsService;
  let budgetRepository: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock; find: jest.Mock };
  let transactionRepository: { find: jest.Mock };

  beforeEach(async () => {
    budgetRepository = {
      findOne: jest.fn(),
      save: jest.fn((entity) => Promise.resolve({ id: 'budget-1', ...entity })),
      create: jest.fn((entity) => entity),
      find: jest.fn(),
    };
    transactionRepository = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        { provide: getRepositoryToken(Budget), useValue: budgetRepository },
        { provide: getRepositoryToken(Transaction), useValue: transactionRepository },
      ],
    }).compile();

    service = module.get(BudgetsService);
  });

  it('prevents duplicate budgets for the same category and period', async () => {
    budgetRepository.findOne.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create('household-1', {
        categoryId: 'category-1',
        month: 8,
        year: 2026,
        limitAmount: 500,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('flags a budget as exceeded once spending passes the limit', async () => {
    budgetRepository.findOne.mockResolvedValue({
      id: 'budget-1',
      householdId: 'household-1',
      categoryId: 'category-1',
      month: 8,
      year: 2026,
      limitAmount: 100,
      alertThreshold: 80,
      category: { name: 'Alimentação' },
    });
    transactionRepository.find.mockResolvedValue([{ amount: '60' }, { amount: '50' }]);

    const progress = await service.getProgress('household-1', 'budget-1');

    expect(progress.spent).toBe(110);
    expect(progress.isExceeded).toBe(true);
    expect(progress.remaining).toBe(-10);
  });

  it('flags a budget as near limit but not exceeded between the threshold and 100%', async () => {
    budgetRepository.findOne.mockResolvedValue({
      id: 'budget-1',
      householdId: 'household-1',
      categoryId: 'category-1',
      month: 8,
      year: 2026,
      limitAmount: 100,
      alertThreshold: 80,
      category: { name: 'Lazer' },
    });
    transactionRepository.find.mockResolvedValue([{ amount: '85' }]);

    const progress = await service.getProgress('household-1', 'budget-1');

    expect(progress.isNearLimit).toBe(true);
    expect(progress.isExceeded).toBe(false);
  });
});
