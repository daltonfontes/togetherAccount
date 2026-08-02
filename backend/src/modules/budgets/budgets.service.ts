import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Budget } from '@/database/entities/budget.entity';
import { Transaction } from '@/database/entities/transaction.entity';
import { TransactionType } from '@/common/enums';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isExceeded: boolean;
  isNearLimit: boolean;
}

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget) private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(householdId: string, dto: CreateBudgetDto): Promise<Budget> {
    const existing = await this.budgetRepository.findOne({
      where: {
        householdId,
        categoryId: dto.categoryId,
        month: dto.month,
        year: dto.year,
      },
    });
    if (existing) {
      throw new ConflictException('A budget for this category and period already exists');
    }
    return this.budgetRepository.save(this.budgetRepository.create({ ...dto, householdId }));
  }

  async findAll(householdId: string, month?: number, year?: number): Promise<BudgetProgress[]> {
    const where: any = { householdId };
    if (month) where.month = month;
    if (year) where.year = year;

    const budgets = await this.budgetRepository.find({
      where,
      relations: ['category'],
      order: { year: 'DESC', month: 'DESC' },
    });

    return Promise.all(budgets.map((budget) => this.calculateProgress(budget)));
  }

  async findOneOrFail(householdId: string, id: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id, householdId },
      relations: ['category'],
    });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return budget;
  }

  async getProgress(householdId: string, id: string): Promise<BudgetProgress> {
    const budget = await this.findOneOrFail(householdId, id);
    return this.calculateProgress(budget);
  }

  async update(householdId: string, id: string, dto: UpdateBudgetDto): Promise<Budget> {
    const budget = await this.findOneOrFail(householdId, id);
    Object.assign(budget, dto);
    return this.budgetRepository.save(budget);
  }

  async remove(householdId: string, id: string): Promise<void> {
    const budget = await this.findOneOrFail(householdId, id);
    await this.budgetRepository.remove(budget);
  }

  private async calculateProgress(budget: Budget): Promise<BudgetProgress> {
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0);
    const toIso = (d: Date) => d.toISOString().slice(0, 10);

    const transactions = await this.transactionRepository.find({
      where: {
        householdId: budget.householdId,
        categoryId: budget.categoryId,
        type: TransactionType.EXPENSE,
        date: Between(toIso(startDate), toIso(endDate)),
      },
    });

    const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const percentageUsed =
      Number(budget.limitAmount) > 0 ? (spent / Number(budget.limitAmount)) * 100 : 0;

    return {
      budget,
      spent,
      remaining: Number(budget.limitAmount) - spent,
      percentageUsed,
      isExceeded: percentageUsed >= 100,
      isNearLimit: percentageUsed >= Number(budget.alertThreshold) && percentageUsed < 100,
    };
  }
}
