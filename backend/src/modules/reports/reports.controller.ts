import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HouseholdMemberGuard } from '@/modules/households/guards/household-member.guard';
import { ReportsService } from './reports.service';
import { CashflowQueryDto } from './dto/cashflow-query.dto';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(HouseholdMemberGuard)
@Controller('households/:householdId')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get the household financial dashboard summary' })
  async getDashboard(@Param('householdId') householdId: string) {
    return this.reportsService.getDashboard(householdId);
  }

  @Get('reports/cashflow')
  @ApiOperation({ summary: 'Get monthly income vs expense series' })
  async getCashflow(@Param('householdId') householdId: string, @Query() query: CashflowQueryDto) {
    return this.reportsService.getCashflow(householdId, query.months ?? 6);
  }

  @Get('reports/by-category')
  @ApiOperation({ summary: 'Get expense breakdown by category for a period' })
  async getByCategory(
    @Param('householdId') householdId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const now = new Date();
    return this.reportsService.getByCategory(
      householdId,
      month ? parseInt(month, 10) : now.getMonth() + 1,
      year ? parseInt(year, 10) : now.getFullYear(),
    );
  }

  @Get('reports/member-spending')
  @ApiOperation({ summary: 'Get expense breakdown by household member for a period' })
  async getMemberSpending(
    @Param('householdId') householdId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const now = new Date();
    return this.reportsService.getMemberSpending(
      householdId,
      month ? parseInt(month, 10) : now.getMonth() + 1,
      year ? parseInt(year, 10) : now.getFullYear(),
    );
  }
}
