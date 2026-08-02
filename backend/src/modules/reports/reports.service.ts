import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction } from '@/database/entities/transaction.entity';
import { BankAccount } from '@/database/entities/bank-account.entity';
import { CreditCard } from '@/database/entities/credit-card.entity';
import { Goal } from '@/database/entities/goal.entity';
import { Budget } from '@/database/entities/budget.entity';
import { TransactionType, GoalStatus } from '@/common/enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(BankAccount) private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(CreditCard) private readonly creditCardRepository: Repository<CreditCard>,
    @InjectRepository(Goal) private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Budget) private readonly budgetRepository: Repository<Budget>,
  ) {}

  async getDashboard(householdId: string) {
    const now = new Date();
    const monthStart = this.toIso(new Date(now.getFullYear(), now.getMonth(), 1));
    const monthEnd = this.toIso(new Date(now.getFullYear(), now.getMonth() + 1, 0));

    const [monthTransactions, accounts, cards, goals, recentTransactions] = await Promise.all([
      this.transactionRepository.find({
        where: { householdId, date: Between(monthStart, monthEnd) },
      }),
      this.bankAccountRepository.find({ where: { householdId, isActive: true } }),
      this.creditCardRepository.find({ where: { householdId, isActive: true } }),
      this.goalRepository.find({ where: { householdId, status: GoalStatus.IN_PROGRESS } }),
      this.transactionRepository.find({
        where: { householdId },
        relations: ['category', 'payer'],
        order: { date: 'DESC', createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    const monthlyIncome = this.sumByType(monthTransactions, TransactionType.INCOME);
    const monthlyExpense = this.sumByType(monthTransactions, TransactionType.EXPENSE);

    const totalBalance = accounts
      .filter((a) => a.includeInTotal)
      .reduce((sum, a) => sum + Number(a.balance), 0);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      monthlyNet: monthlyIncome - monthlyExpense,
      accountsCount: accounts.length,
      creditCardsCount: cards.length,
      activeGoalsCount: goals.length,
      goals: goals.slice(0, 5).map((g) => ({
        id: g.id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        progress: Number(g.targetAmount) > 0 ? (Number(g.currentAmount) / Number(g.targetAmount)) * 100 : 0,
      })),
      recentTransactions,
    };
  }

  async getCashflow(householdId: string, months: number) {
    const now = new Date();
    const series: { month: string; income: number; expense: number; net: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = this.toIso(date);
      const end = this.toIso(new Date(date.getFullYear(), date.getMonth() + 1, 0));

      const transactions = await this.transactionRepository.find({
        where: { householdId, date: Between(start, end) },
      });

      const income = this.sumByType(transactions, TransactionType.INCOME);
      const expense = this.sumByType(transactions, TransactionType.EXPENSE);

      series.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        income,
        expense,
        net: income - expense,
      });
    }

    return series;
  }

  async getByCategory(householdId: string, month: number, year: number) {
    const start = this.toIso(new Date(year, month - 1, 1));
    const end = this.toIso(new Date(year, month, 0));

    const transactions = await this.transactionRepository.find({
      where: { householdId, date: Between(start, end), type: TransactionType.EXPENSE },
      relations: ['category'],
    });

    const grouped = new Map<string, { categoryId: string; name: string; color: string; total: number }>();
    for (const t of transactions) {
      const key = t.categoryId;
      const entry = grouped.get(key) ?? {
        categoryId: key,
        name: t.category.name,
        color: t.category.color,
        total: 0,
      };
      entry.total += Number(t.amount);
      grouped.set(key, entry);
    }

    return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
  }

  async getMemberSpending(householdId: string, month: number, year: number) {
    const start = this.toIso(new Date(year, month - 1, 1));
    const end = this.toIso(new Date(year, month, 0));

    const transactions = await this.transactionRepository.find({
      where: { householdId, date: Between(start, end), type: TransactionType.EXPENSE },
      relations: ['payer'],
    });

    const grouped = new Map<string, { userId: string; name: string; total: number }>();
    for (const t of transactions) {
      const key = t.payerId;
      const entry = grouped.get(key) ?? { userId: key, name: t.payer.fullName, total: 0 };
      entry.total += Number(t.amount);
      grouped.set(key, entry);
    }

    return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
  }

  private sumByType(transactions: Transaction[], type: TransactionType): number {
    return transactions
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }

  private toIso(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}
