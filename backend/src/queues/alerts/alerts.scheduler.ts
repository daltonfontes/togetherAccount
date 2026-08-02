import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Budget } from '@/database/entities/budget.entity';
import { Transaction } from '@/database/entities/transaction.entity';
import { CreditCard } from '@/database/entities/credit-card.entity';
import { HouseholdMember } from '@/database/entities/household-member.entity';
import { NotificationType, TransactionType } from '@/common/enums';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class AlertsScheduler {
  private readonly logger = new Logger(AlertsScheduler.name);

  constructor(
    @InjectRepository(Budget) private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(CreditCard) private readonly creditCardRepository: Repository<CreditCard>,
    @InjectRepository(HouseholdMember)
    private readonly memberRepository: Repository<HouseholdMember>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkBudgetAlerts(): Promise<void> {
    const now = new Date();
    const budgets = await this.budgetRepository.find({
      where: { month: now.getMonth() + 1, year: now.getFullYear() },
      relations: ['category'],
    });

    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    for (const budget of budgets) {
      const transactions = await this.transactionRepository.find({
        where: {
          householdId: budget.householdId,
          categoryId: budget.categoryId,
          type: TransactionType.EXPENSE,
          date: Between(start, end),
        },
      });
      const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const percentage =
        Number(budget.limitAmount) > 0 ? (spent / Number(budget.limitAmount)) * 100 : 0;

      if (percentage >= Number(budget.alertThreshold)) {
        const members = await this.memberRepository.find({
          where: { householdId: budget.householdId },
        });
        const title = percentage >= 100 ? 'Orçamento estourado' : 'Orçamento quase no limite';
        for (const member of members) {
          await this.notificationsService.create({
            userId: member.userId,
            householdId: budget.householdId,
            type: NotificationType.BUDGET_EXCEEDED,
            title,
            message: `${budget.category.name}: ${percentage.toFixed(0)}% do orçamento utilizado`,
            metadata: { budgetId: budget.id, percentage },
          });
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkBillsDue(): Promise<void> {
    const now = new Date();
    const cards = await this.creditCardRepository.find({ where: { isActive: true } });

    for (const card of cards) {
      const daysUntilDue = this.daysUntil(card.dueDay, now);
      if (daysUntilDue === 3) {
        await this.notificationsService.create({
          userId: card.ownerId,
          householdId: card.householdId,
          type: NotificationType.BILL_DUE,
          title: 'Fatura vence em breve',
          message: `A fatura do cartão "${card.name}" vence em 3 dias`,
          metadata: { creditCardId: card.id },
        });
      }
    }
  }

  private daysUntil(day: number, now: Date): number {
    let dueDate = new Date(now.getFullYear(), now.getMonth(), day);
    if (dueDate < now) {
      dueDate = new Date(now.getFullYear(), now.getMonth() + 1, day);
    }
    return Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}
