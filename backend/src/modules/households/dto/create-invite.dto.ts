import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { HouseholdRole } from '@/common/enums';

export class CreateInviteDto {
  @ApiProperty({ example: 'partner@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: HouseholdRole, default: HouseholdRole.MEMBER })
  @IsOptional()
  @IsEnum(HouseholdRole)
  role?: HouseholdRole;
}
