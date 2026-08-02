import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Transaction } from '@/database/entities/transaction.entity';
import { TransactionSplit } from '@/database/entities/transaction-split.entity';
import { Category } from '@/database/entities/category.entity';
import { BankAccount } from '@/database/entities/bank-account.entity';
import { CreditCard } from '@/database/entities/credit-card.entity';
import {
  AuditAction,
  NotificationType,
  SplitMethod,
  SplitStatus,
  TransactionType,
} from '@/common/enums';
import { PaginatedResultDto } from '@/common/dto/pagination-query.dto';
import { AuditService } from '@/modules/audit/audit.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionSplit)
    private readonly splitRepository: Repository<TransactionSplit>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    householdId: string,
    payerId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    await this.assertCategoryBelongsToHousehold(householdId, dto.categoryId);
    if (dto.bankAccountId) {
      await this.assertBankAccountBelongsToHousehold(householdId, dto.bankAccountId);
    }
    if (dto.creditCardId) {
      await this.assertCreditCardBelongsToHousehold(householdId, dto.creditCardId);
    }

    const transaction = this.transactionRepository.create({
      householdId,
      payerId,
      categoryId: dto.categoryId,
      bankAccountId: dto.bankAccountId,
      creditCardId: dto.creditCardId,
      type: dto.type,
      amount: dto.amount,
      description: dto.description,
      notes: dto.notes,
      date: dto.date,
      isRecurring: dto.isRecurring ?? false,
      recurrenceFrequency: dto.recurrenceFrequency,
      recurrenceEndDate: dto.recurrenceEndDate,
      isShared: dto.isShared ?? false,
    });

    const saved = await this.transactionRepository.save(transaction);

    if (dto.isShared && dto.splits && dto.splits.length > 0) {
      const splits = this.buildSplits(saved, dto);
      saved.splits = await this.splitRepository.save(splits);

      for (const split of saved.splits) {
        if (split.userId !== payerId) {
          await this.notificationsService.create({
            userId: split.userId,
            householdId,
            type: NotificationType.SPLIT_CHARGE,
            title: 'Você tem uma nova divisão de conta',
            message: `${dto.description}: sua parte é ${split.amount}`,
            metadata: { transactionId: saved.id },
          });
        }
      }
    }

    if (dto.bankAccountId && !dto.creditCardId) {
      const delta = dto.type === TransactionType.INCOME ? dto.amount : -dto.amount;
      await this.bankAccountRepository.increment({ id: dto.bankAccountId }, 'balance', delta);
    }

    await this.auditService.log({
      householdId,
      userId: payerId,
      action: AuditAction.CREATE,
      entityType: 'Transaction',
      entityId: saved.id,
      newValue: { amount: saved.amount, description: saved.description, type: saved.type },
    });

    return this.findOneOrFail(householdId, saved.id);
  }

  async findAll(
    householdId: string,
    query: QueryTransactionsDto,
  ): Promise<PaginatedResultDto<Transaction>> {
    const where: FindOptionsWhere<Transaction> = { householdId };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.bankAccountId) where.bankAccountId = query.bankAccountId;
    if (query.creditCardId) where.creditCardId = query.creditCardId;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.dateFrom && query.dateTo) {
      where.date = Between(query.dateFrom, query.dateTo);
    }

    const [items, total] = await this.transactionRepository.findAndCount({
      where,
      relations: ['category', 'payer', 'bankAccount', 'creditCard', 'splits', 'splits.user'],
      order: { date: 'DESC', createdAt: 'DESC' },
      skip: query.skip,
      take: query.limit,
    });

    return new PaginatedResultDto(items, total, query.page, query.limit);
  }

  async findOneOrFail(householdId: string, id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, householdId },
      relations: ['category', 'payer', 'bankAccount', 'creditCard', 'splits', 'splits.user'],
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async update(
    householdId: string,
    id: string,
    userId: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOneOrFail(householdId, id);
    const oldValue = { amount: transaction.amount, description: transaction.description };

    await this.revertBalanceEffect(transaction);

    Object.assign(transaction, {
      categoryId: dto.categoryId ?? transaction.categoryId,
      bankAccountId: dto.bankAccountId ?? transaction.bankAccountId,
      creditCardId: dto.creditCardId ?? transaction.creditCardId,
      type: dto.type ?? transaction.type,
      amount: dto.amount ?? transaction.amount,
      description: dto.description ?? transaction.description,
      notes: dto.notes ?? transaction.notes,
      date: dto.date ?? transaction.date,
      isRecurring: dto.isRecurring ?? transaction.isRecurring,
      recurrenceFrequency: dto.recurrenceFrequency ?? transaction.recurrenceFrequency,
      recurrenceEndDate: dto.recurrenceEndDate ?? transaction.recurrenceEndDate,
      isShared: dto.isShared ?? transaction.isShared,
    });

    const saved = await this.transactionRepository.save(transaction);
    await this.applyBalanceEffect(saved);

    if (dto.splits) {
      await this.splitRepository.delete({ transactionId: saved.id });
      const splits = this.buildSplits(saved, dto as CreateTransactionDto);
      await this.splitRepository.save(splits);
    }

    await this.auditService.log({
      householdId,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Transaction',
      entityId: id,
      oldValue,
      newValue: { amount: saved.amount, description: saved.description },
    });

    return this.findOneOrFail(householdId, id);
  }

  async remove(householdId: string, id: string, userId: string): Promise<void> {
    const transaction = await this.findOneOrFail(householdId, id);
    await this.revertBalanceEffect(transaction);
    await this.transactionRepository.remove(transaction);
    await this.auditService.log({
      householdId,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Transaction',
      entityId: id,
    });
  }

  async settleSplit(householdId: string, transactionId: string, splitId: string): Promise<TransactionSplit> {
    const split = await this.splitRepository.findOne({
      where: { id: splitId, transactionId },
      relations: ['transaction'],
    });
    if (!split || split.transaction.householdId !== householdId) {
      throw new NotFoundException('Split not found');
    }
    split.status = SplitStatus.SETTLED;
    split.settledAt = new Date();
    const saved = await this.splitRepository.save(split);

    await this.notificationsService.create({
      userId: split.transaction.payerId,
      householdId,
      type: NotificationType.SPLIT_SETTLED,
      title: 'Divisão quitada',
      message: `Uma divisão de "${split.transaction.description}" foi quitada`,
      metadata: { transactionId, splitId },
    });

    return saved;
  }

  async getPendingSplitsForUser(householdId: string, userId: string): Promise<TransactionSplit[]> {
    return this.splitRepository.find({
      where: { userId, status: SplitStatus.PENDING, transaction: { householdId } },
      relations: ['transaction'],
    });
  }

  private buildSplits(transaction: Transaction, dto: CreateTransactionDto): TransactionSplit[] {
    const method = dto.splitMethod ?? SplitMethod.EQUAL;
    const inputs = dto.splits ?? [];

    if (method === SplitMethod.EQUAL) {
      const share = Number((dto.amount / inputs.length).toFixed(2));
      return inputs.map((input) =>
        this.splitRepository.create({
          transactionId: transaction.id,
          userId: input.userId,
          amount: share,
          status: SplitStatus.PENDING,
        }),
      );
    }

    if (method === SplitMethod.PERCENTAGE) {
      const totalPercentage = inputs.reduce((sum, i) => sum + (i.percentage ?? 0), 0);
      if (Math.round(totalPercentage) !== 100) {
        throw new BadRequestException('Split percentages must sum to 100');
      }
      return inputs.map((input) =>
        this.splitRepository.create({
          transactionId: transaction.id,
          userId: input.userId,
          amount: Number(((dto.amount * (input.percentage ?? 0)) / 100).toFixed(2)),
          percentage: input.percentage,
          status: SplitStatus.PENDING,
        }),
      );
    }

    const totalFixed = inputs.reduce((sum, i) => sum + (i.amount ?? 0), 0);
    if (Math.abs(totalFixed - dto.amount) > 0.01) {
      throw new BadRequestException('Fixed split amounts must sum to the transaction amount');
    }
    return inputs.map((input) =>
      this.splitRepository.create({
        transactionId: transaction.id,
        userId: input.userId,
        amount: input.amount ?? 0,
        status: SplitStatus.PENDING,
      }),
    );
  }

  private async applyBalanceEffect(transaction: Transaction): Promise<void> {
    if (transaction.bankAccountId && !transaction.creditCardId) {
      const delta =
        transaction.type === TransactionType.INCOME ? transaction.amount : -transaction.amount;
      await this.bankAccountRepository.increment(
        { id: transaction.bankAccountId },
        'balance',
        delta,
      );
    }
  }

  private async revertBalanceEffect(transaction: Transaction): Promise<void> {
    if (transaction.bankAccountId && !transaction.creditCardId) {
      const delta =
        transaction.type === TransactionType.INCOME ? -transaction.amount : transaction.amount;
      await this.bankAccountRepository.increment(
        { id: transaction.bankAccountId },
        'balance',
        delta,
      );
    }
  }

  private async assertCategoryBelongsToHousehold(householdId: string, categoryId: string) {
    const exists = await this.categoryRepository.exist({ where: { id: categoryId, householdId } });
    if (!exists) {
      throw new BadRequestException('Category does not belong to this household');
    }
  }

  private async assertBankAccountBelongsToHousehold(householdId: string, bankAccountId: string) {
    const exists = await this.bankAccountRepository.exist({
      where: { id: bankAccountId, householdId },
    });
    if (!exists) {
      throw new BadRequestException('Bank account does not belong to this household');
    }
  }

  private async assertCreditCardBelongsToHousehold(householdId: string, creditCardId: string) {
    const exists = await this.creditCardRepository.exist({
      where: { id: creditCardId, householdId },
    });
    if (!exists) {
      throw new BadRequestException('Credit card does not belong to this household');
    }
  }
}
