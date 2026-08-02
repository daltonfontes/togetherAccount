import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HouseholdMemberGuard } from '@/modules/households/guards/household-member.guard';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(HouseholdMemberGuard)
@Controller('households/:householdId/budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a budget for a category and period' })
  async create(@Param('householdId') householdId: string, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(householdId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List budgets with spending progress' })
  async findAll(
    @Param('householdId') householdId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.budgetsService.findAll(
      householdId,
      month ? parseInt(month, 10) : undefined,
      year ? parseInt(year, 10) : undefined,
    );
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get spending progress for a budget' })
  async getProgress(@Param('householdId') householdId: string, @Param('id') id: string) {
    return this.budgetsService.getProgress(householdId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  async update(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(householdId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  async remove(@Param('householdId') householdId: string, @Param('id') id: string) {
    await this.budgetsService.remove(householdId, id);
  }
}
