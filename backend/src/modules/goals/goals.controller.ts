import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { HouseholdMemberGuard } from '@/modules/households/guards/household-member.guard';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(HouseholdMemberGuard)
@Controller('households/:householdId/goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a financial goal' })
  async create(@Param('householdId') householdId: string, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(householdId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List financial goals' })
  async findAll(@Param('householdId') householdId: string) {
    return this.goalsService.findAll(householdId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a financial goal' })
  async findOne(@Param('householdId') householdId: string, @Param('id') id: string) {
    return this.goalsService.findOneOrFail(householdId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a financial goal' })
  async update(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(householdId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a financial goal' })
  async remove(@Param('householdId') householdId: string, @Param('id') id: string) {
    await this.goalsService.remove(householdId, id);
  }

  @Post(':id/contributions')
  @ApiOperation({ summary: 'Add a contribution towards a goal' })
  async addContribution(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateContributionDto,
  ) {
    return this.goalsService.addContribution(householdId, id, userId, dto);
  }
}
