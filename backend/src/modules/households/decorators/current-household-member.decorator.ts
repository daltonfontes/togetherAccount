import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { HouseholdMember } from '@/database/entities/household-member.entity';

export const CurrentHouseholdMember = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): HouseholdMember => {
    const request = ctx.switchToHttp().getRequest();
    return request.householdMember;
  },
);
