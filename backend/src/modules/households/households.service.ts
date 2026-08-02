import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { Household } from '@/database/entities/household.entity';
import { HouseholdMember } from '@/database/entities/household-member.entity';
import { Category } from '@/database/entities/category.entity';
import { HouseholdRole, AuditAction } from '@/common/enums';
import { DEFAULT_CATEGORIES } from '@/database/seeds/default-categories';
import { AuditService } from '@/modules/audit/audit.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';

@Injectable()
export class HouseholdsService {
  constructor(
    @InjectRepository(Household)
    private readonly householdRepository: Repository<Household>,
    @InjectRepository(HouseholdMember)
    private readonly memberRepository: Repository<HouseholdMember>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly auditService: AuditService,
  ) {}

  async create(userId: string, dto: CreateHouseholdDto): Promise<Household> {
    const household = await this.householdRepository.save(
      this.householdRepository.create({
        name: dto.name,
        description: dto.description,
        currency: dto.currency || 'BRL',
        ownerId: userId,
        inviteCode: randomBytes(6).toString('hex'),
      }),
    );

    await this.memberRepository.save(
      this.memberRepository.create({
        householdId: household.id,
        userId,
        role: HouseholdRole.OWNER,
      }),
    );

    await this.categoryRepository.save(
      DEFAULT_CATEGORIES.map((category) =>
        this.categoryRepository.create({
          ...category,
          householdId: household.id,
          isDefault: true,
        }),
      ),
    );

    await this.auditService.log({
      householdId: household.id,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Household',
      entityId: household.id,
      newValue: { name: household.name },
    });

    return household;
  }

  async findForUser(userId: string): Promise<Household[]> {
    const memberships = await this.memberRepository.find({
      where: { userId },
      relations: ['household'],
    });
    return memberships.map((m) => m.household);
  }

  async findByIdOrFail(id: string): Promise<Household> {
    const household = await this.householdRepository.findOne({ where: { id } });
    if (!household) {
      throw new NotFoundException('Household not found');
    }
    return household;
  }

  async update(id: string, userId: string, dto: UpdateHouseholdDto): Promise<Household> {
    const household = await this.findByIdOrFail(id);
    const oldValue = { name: household.name, description: household.description };
    Object.assign(household, dto);
    const saved = await this.householdRepository.save(household);

    await this.auditService.log({
      householdId: id,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Household',
      entityId: id,
      oldValue,
      newValue: dto,
    });

    return saved;
  }

  async remove(id: string, userId: string): Promise<void> {
    const household = await this.findByIdOrFail(id);
    if (household.ownerId !== userId) {
      throw new ForbiddenException('Only the household owner can delete it');
    }
    await this.householdRepository.remove(household);
  }

  async listMembers(householdId: string): Promise<HouseholdMember[]> {
    return this.memberRepository.find({
      where: { householdId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  async updateMemberRole(
    householdId: string,
    memberId: string,
    role: HouseholdRole,
    actingUserId: string,
  ): Promise<HouseholdMember> {
    const member = await this.memberRepository.findOne({
      where: { id: memberId, householdId },
    });
    if (!member) {
      throw new NotFoundException('Household member not found');
    }
    const oldRole = member.role;
    member.role = role;
    const saved = await this.memberRepository.save(member);

    await this.auditService.log({
      householdId,
      userId: actingUserId,
      action: AuditAction.UPDATE,
      entityType: 'HouseholdMember',
      entityId: member.id,
      oldValue: { role: oldRole },
      newValue: { role },
    });

    return saved;
  }

  async removeMember(householdId: string, memberId: string, actingUserId: string): Promise<void> {
    const household = await this.findByIdOrFail(householdId);
    const member = await this.memberRepository.findOne({
      where: { id: memberId, householdId },
    });
    if (!member) {
      throw new NotFoundException('Household member not found');
    }
    if (member.userId === household.ownerId) {
      throw new ForbiddenException('Cannot remove the household owner');
    }

    await this.memberRepository.remove(member);

    await this.auditService.log({
      householdId,
      userId: actingUserId,
      action: AuditAction.REMOVE_MEMBER,
      entityType: 'HouseholdMember',
      entityId: memberId,
    });
  }

  async leave(householdId: string, userId: string): Promise<void> {
    const household = await this.findByIdOrFail(householdId);
    if (household.ownerId === userId) {
      throw new ForbiddenException('The owner cannot leave the household. Delete it instead.');
    }
    const member = await this.memberRepository.findOne({ where: { householdId, userId } });
    if (member) {
      await this.memberRepository.remove(member);
    }
  }

  async isMember(householdId: string, userId: string): Promise<boolean> {
    const count = await this.memberRepository.count({ where: { householdId, userId } });
    return count > 0;
  }
}
