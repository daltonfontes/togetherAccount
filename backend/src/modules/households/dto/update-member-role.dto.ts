import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { HouseholdRole } from '@/common/enums';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: HouseholdRole })
  @IsEnum(HouseholdRole)
  role: HouseholdRole;
}
