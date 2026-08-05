import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { MAX_MONETARY_VALUE } from '@/common/constants';

export class TransactionSplitInputDto {
  @ApiPropertyOptional()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_MONETARY_VALUE)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;
}
