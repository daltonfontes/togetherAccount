import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ minimum: 2000 })
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  limitAmount: number;

  @ApiPropertyOptional({ default: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  alertThreshold?: number;
}
