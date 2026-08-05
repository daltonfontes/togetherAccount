import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { MAX_MONETARY_VALUE } from '@/common/constants';

export class CreateContributionDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  @Max(MAX_MONETARY_VALUE)
  amount: number;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
