import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength } from 'class-validator';
import { AccountType } from '@/common/enums';
import { MAX_MONETARY_VALUE } from '@/common/constants';

export class CreateBankAccountDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bank?: string;

  @ApiPropertyOptional({ enum: AccountType, default: AccountType.CHECKING })
  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Max(MAX_MONETARY_VALUE)
  balance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeInTotal?: boolean;
}
