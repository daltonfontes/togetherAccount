import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseholdMember } from '@/database/entities/household-member.entity';

@Injectable()
export class HouseholdMemberGuard implements CanActivate {
  constructor(
    @InjectRepository(HouseholdMember)
    private readonly householdMemberRepository: Repository<HouseholdMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const householdId = request.params.householdId;
    const userId = request.user?.id;

    if (!householdId || !userId) {
      throw new ForbiddenException('Household membership required');
    }

    const membership = await this.householdMemberRepository.findOne({
      where: { householdId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this household');
    }

    request.householdMember = membership;
    return true;
  }
}
