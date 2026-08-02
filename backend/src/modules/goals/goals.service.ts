import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from '@/database/entities/goal.entity';
import { GoalContribution } from '@/database/entities/goal-contribution.entity';
import { GoalStatus, NotificationType } from '@/common/enums';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { HouseholdMember } from '@/database/entities/household-member.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal) private readonly goalRepository: Repository<Goal>,
    @InjectRepository(GoalContribution)
    private readonly contributionRepository: Repository<GoalContribution>,
    @InjectRepository(HouseholdMember)
    private readonly memberRepository: Repository<HouseholdMember>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(householdId: string, dto: CreateGoalDto): Promise<Goal> {
    return this.goalRepository.save(this.goalRepository.create({ ...dto, householdId }));
  }

  async findAll(householdId: string): Promise<Goal[]> {
    return this.goalRepository.find({
      where: { householdId },
      relations: ['contributions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneOrFail(householdId: string, id: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id, householdId },
      relations: ['contributions', 'contributions.user'],
    });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    return goal;
  }

  async update(householdId: string, id: string, dto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.findOneOrFail(householdId, id);
    Object.assign(goal, dto);
    return this.goalRepository.save(goal);
  }

  async remove(householdId: string, id: string): Promise<void> {
    const goal = await this.findOneOrFail(householdId, id);
    await this.goalRepository.remove(goal);
  }

  async addContribution(
    householdId: string,
    goalId: string,
    userId: string,
    dto: CreateContributionDto,
  ): Promise<Goal> {
    const goal = await this.findOneOrFail(householdId, goalId);

    await this.contributionRepository.save(
      this.contributionRepository.create({ ...dto, goalId, userId }),
    );

    goal.currentAmount = Number(goal.currentAmount) + dto.amount;

    if (goal.currentAmount >= Number(goal.targetAmount) && goal.status === GoalStatus.IN_PROGRESS) {
      goal.status = GoalStatus.COMPLETED;
      await this.notifyGoalReached(goal);
    }

    await this.goalRepository.save(goal);
    return this.findOneOrFail(householdId, goalId);
  }

  private async notifyGoalReached(goal: Goal): Promise<void> {
    const members = await this.memberRepository.find({ where: { householdId: goal.householdId } });
    await Promise.all(
      members.map((member) =>
        this.notificationsService.create({
          userId: member.userId,
          householdId: goal.householdId,
          type: NotificationType.GOAL_REACHED,
          title: 'Meta alcançada! 🎉',
          message: `A meta "${goal.name}" foi alcançada`,
          metadata: { goalId: goal.id },
        }),
      ),
    );
  }
}
