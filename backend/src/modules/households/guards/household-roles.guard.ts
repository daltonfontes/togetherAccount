import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HouseholdRole } from '@/common/enums';
import { HOUSEHOLD_ROLES_KEY } from '../decorators/household-roles.decorator';
import { HouseholdMember } from '@/database/entities/household-member.entity';

@Injectable()
export class HouseholdRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<HouseholdRole[]>(
      HOUSEHOLD_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const membership: HouseholdMember = request.householdMember;

    if (!membership || !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient permissions in this household');
    }

    return true;
  }
}
