import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CardBrand } from '@/common/enums';

export class CreateCreditCardDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ enum: CardBrand, default: CardBrand.OTHER })
  @IsOptional()
  @IsEnum(CardBrand)
  brand?: CardBrand;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  creditLimit: number;

  @ApiProperty({ minimum: 1, maximum: 31 })
  @IsInt()
  @Min(1)
  @Max(31)
  closingDay: number;

  @ApiProperty({ minimum: 1, maximum: 31 })
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;
}
