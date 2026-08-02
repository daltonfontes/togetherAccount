import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '@/database/entities/transaction.entity';
import { TransactionSplit } from '@/database/entities/transaction-split.entity';
import { Category } from '@/database/entities/category.entity';
import { BankAccount } from '@/database/entities/bank-account.entity';
import { CreditCard } from '@/database/entities/credit-card.entity';
import { SplitMethod, TransactionType } from '@/common/enums';
import { AuditService } from '@/modules/audit/audit.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { TransactionsService } from './transactions.service';

function repoMock() {
  return {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) =>
      Promise.resolve(Array.isArray(entity) ? entity : { id: 'tx-1', ...entity }),
    ),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    increment: jest.fn(),
    exist: jest.fn().mockResolvedValue(true),
    delete: jest.fn(),
  };
}

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepository: ReturnType<typeof repoMock>;
  let bankAccountRepository: ReturnType<typeof repoMock>;

  beforeEach(async () => {
    transactionRepository = repoMock();
    bankAccountRepository = repoMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getRepositoryToken(Transaction), useValue: transactionRepository },
        { provide: getRepositoryToken(TransactionSplit), useValue: repoMock() },
        { provide: getRepositoryToken(Category), useValue: repoMock() },
        { provide: getRepositoryToken(BankAccount), useValue: bankAccountRepository },
        { provide: getRepositoryToken(CreditCard), useValue: repoMock() },
        { provide: AuditService, useValue: { log: jest.fn() } },
        { provide: NotificationsService, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get(TransactionsService);
    transactionRepository.findOne.mockResolvedValue({
      id: 'tx-1',
      householdId: 'household-1',
      splits: [],
    });
  });

  it('debits the bank account balance when an expense transaction is created', async () => {
    await service.create('household-1', 'user-1', {
      type: TransactionType.EXPENSE,
      amount: 100,
      description: 'Groceries',
      date: '2026-08-01',
      categoryId: 'category-1',
      bankAccountId: 'account-1',
    } as any);

    expect(bankAccountRepository.increment).toHaveBeenCalledWith(
      { id: 'account-1' },
      'balance',
      -100,
    );
  });

  it('credits the bank account balance when an income transaction is created', async () => {
    await service.create('household-1', 'user-1', {
      type: TransactionType.INCOME,
      amount: 500,
      description: 'Salary',
      date: '2026-08-01',
      categoryId: 'category-1',
      bankAccountId: 'account-1',
    } as any);

    expect(bankAccountRepository.increment).toHaveBeenCalledWith(
      { id: 'account-1' },
      'balance',
      500,
    );
  });

  it('does not touch balance when paid with a credit card', async () => {
    await service.create('household-1', 'user-1', {
      type: TransactionType.EXPENSE,
      amount: 100,
      description: 'Dinner',
      date: '2026-08-01',
      categoryId: 'category-1',
      creditCardId: 'card-1',
    } as any);

    expect(bankAccountRepository.increment).not.toHaveBeenCalled();
  });

  it('rejects percentage splits that do not sum to 100', async () => {
    await expect(
      service.create('household-1', 'user-1', {
        type: TransactionType.EXPENSE,
        amount: 200,
        description: 'Rent',
        date: '2026-08-01',
        categoryId: 'category-1',
        isShared: true,
        splitMethod: SplitMethod.PERCENTAGE,
        splits: [
          { userId: 'user-1', percentage: 60 },
          { userId: 'user-2', percentage: 30 },
        ],
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects fixed splits that do not sum to the transaction amount', async () => {
    await expect(
      service.create('household-1', 'user-1', {
        type: TransactionType.EXPENSE,
        amount: 200,
        description: 'Rent',
        date: '2026-08-01',
        categoryId: 'category-1',
        isShared: true,
        splitMethod: SplitMethod.FIXED,
        splits: [
          { userId: 'user-1', amount: 100 },
          { userId: 'user-2', amount: 50 },
        ],
      } as any),
    ).rejects.toThrow(BadRequestException);
  });
});
