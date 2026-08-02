import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '@/database/entities/bank-account.entity';
import { AuditAction } from '@/common/enums';
import { AuditService } from '@/modules/audit/audit.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    householdId: string,
    ownerId: string,
    dto: CreateBankAccountDto,
  ): Promise<BankAccount> {
    const account = await this.bankAccountRepository.save(
      this.bankAccountRepository.create({ ...dto, householdId, ownerId }),
    );
    await this.auditService.log({
      householdId,
      userId: ownerId,
      action: AuditAction.CREATE,
      entityType: 'BankAccount',
      entityId: account.id,
      newValue: { name: account.name },
    });
    return account;
  }

  async findAll(householdId: string): Promise<BankAccount[]> {
    return this.bankAccountRepository.find({
      where: { householdId },
      relations: ['owner'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOneOrFail(householdId: string, id: string): Promise<BankAccount> {
    const account = await this.bankAccountRepository.findOne({
      where: { id, householdId },
      relations: ['owner'],
    });
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }
    return account;
  }

  async update(
    householdId: string,
    id: string,
    userId: string,
    dto: UpdateBankAccountDto,
  ): Promise<BankAccount> {
    const account = await this.findOneOrFail(householdId, id);
    const oldValue = { name: account.name, balance: account.balance };
    Object.assign(account, dto);
    const saved = await this.bankAccountRepository.save(account);
    await this.auditService.log({
      householdId,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'BankAccount',
      entityId: id,
      oldValue,
      newValue: dto,
    });
    return saved;
  }

  async remove(householdId: string, id: string, userId: string): Promise<void> {
    const account = await this.findOneOrFail(householdId, id);
    await this.bankAccountRepository.remove(account);
    await this.auditService.log({
      householdId,
      userId,
      action: AuditAction.DELETE,
      entityType: 'BankAccount',
      entityId: id,
    });
  }

  async getTotalBalance(householdId: string): Promise<number> {
    const accounts = await this.bankAccountRepository.find({
      where: { householdId, includeInTotal: true, isActive: true },
    });
    return accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  }

  async adjustBalance(accountId: string, delta: number): Promise<void> {
    await this.bankAccountRepository.increment({ id: accountId }, 'balance', delta);
  }
}
