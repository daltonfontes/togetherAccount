import { SetMetadata } from '@nestjs/common';
import { HouseholdRole } from '@/common/enums';

export const HOUSEHOLD_ROLES_KEY = 'householdRoles';
export const HouseholdRoles = (...roles: HouseholdRole[]) =>
  SetMetadata(HOUSEHOLD_ROLES_KEY, roles);
