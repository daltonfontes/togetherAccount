import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCard } from '@/database/entities/credit-card.entity';
import { Transaction } from '@/database/entities/transaction.entity';
import { AuditAction, TransactionType } from '@/common/enums';
import { AuditService } from '@/modules/audit/audit.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';

@Injectable()
export class CreditCardsService {
  constructor(
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    householdId: string,
    ownerId: string,
    dto: CreateCreditCardDto,
  ): Promise<CreditCard> {
    const card = await this.creditCardRepository.save(
      this.creditCardRepository.create({ ...dto, householdId, ownerId }),
    );
    await this.auditService.log({
      householdId,
      userId: ownerId,
      action: AuditAction.CREATE,
      entityType: 'CreditCard',
      entityId: card.id,
      newValue: { name: card.name },
    });
    return card;
  }

  async findAll(householdId: string): Promise<CreditCard[]> {
    return this.creditCardRepository.find({
      where: { householdId },
      relations: ['owner'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOneOrFail(householdId: string, id: string): Promise<CreditCard> {
    const card = await this.creditCardRepository.findOne({
      where: { id, householdId },
      relations: ['owner'],
    });
    if (!card) {
      throw new NotFoundException('Credit card not found');
    }
    return card;
  }

  async update(
    householdId: string,
    id: string,
    userId: string,
    dto: UpdateCreditCardDto,
  ): Promise<CreditCard> {
    const card = await this.findOneOrFail(householdId, id);
    Object.assign(card, dto);
    const saved = await this.creditCardRepository.save(card);
    await this.auditService.log({
      householdId,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'CreditCard',
      entityId: id,
      newValue: dto,
    });
    return saved;
  }

  async remove(householdId: string, id: string, userId: string): Promise<void> {
    const card = await this.findOneOrFail(householdId, id);
    await this.creditCardRepository.remove(card);
    await this.auditService.log({
      householdId,
      userId,
      action: AuditAction.DELETE,
      entityType: 'CreditCard',
      entityId: id,
    });
  }

  async getCurrentInvoice(householdId: string, id: string) {
    const card = await this.findOneOrFail(householdId, id);
    const { start, end } = this.getCurrentCycle(card.closingDay);

    const transactions = await this.transactionRepository.find({
      where: { householdId, creditCardId: id, type: TransactionType.EXPENSE },
      order: { date: 'DESC' },
    });

    const cycleTransactions = transactions.filter(
      (t) => t.date >= start && t.date <= end,
    );
    const total = cycleTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const usedPercentage = card.creditLimit > 0 ? (total / Number(card.creditLimit)) * 100 : 0;

    return {
      cardId: id,
      cycleStart: start,
      cycleEnd: end,
      total,
      availableLimit: Number(card.creditLimit) - total,
      usedPercentage: Math.min(usedPercentage, 100),
      transactions: cycleTransactions,
    };
  }

  private getCurrentCycle(closingDay: number): { start: string; end: string } {
    const now = new Date();
    let end = new Date(now.getFullYear(), now.getMonth(), closingDay);
    if (now.getDate() > closingDay) {
      end = new Date(now.getFullYear(), now.getMonth() + 1, closingDay);
    }
    const start = new Date(end);
    start.setMonth(start.getMonth() - 1);
    start.setDate(start.getDate() + 1);

    const toIso = (d: Date) => d.toISOString().slice(0, 10);
    return { start: toIso(start), end: toIso(end) };
  }
}
