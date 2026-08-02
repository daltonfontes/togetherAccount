import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { AuditService } from '@/modules/audit/audit.service';
import { HouseholdRole } from '@/common/enums';
import { HouseholdsService } from './households.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { HouseholdMemberGuard } from './guards/household-member.guard';
import { HouseholdRolesGuard } from './guards/household-roles.guard';
import { HouseholdRoles } from './decorators/household-roles.decorator';

@ApiTags('households')
@ApiBearerAuth()
@Controller('households')
export class HouseholdsController {
  constructor(
    private readonly householdsService: HouseholdsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new household' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateHouseholdDto) {
    return this.householdsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List households the current user belongs to' })
  async findForUser(@CurrentUser('id') userId: string) {
    return this.householdsService.findForUser(userId);
  }

  @UseGuards(HouseholdMemberGuard)
  @Get(':householdId')
  @ApiOperation({ summary: 'Get household details' })
  async findOne(@Param('householdId') householdId: string) {
    return this.householdsService.findByIdOrFail(householdId);
  }

  @UseGuards(HouseholdMemberGuard, HouseholdRolesGuard)
  @HouseholdRoles(HouseholdRole.OWNER, HouseholdRole.ADMIN)
  @Patch(':householdId')
  @ApiOperation({ summary: 'Update household details' })
  async update(
    @Param('householdId') householdId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateHouseholdDto,
  ) {
    return this.householdsService.update(householdId, userId, dto);
  }

  @UseGuards(HouseholdMemberGuard)
  @Delete(':householdId')
  @ApiOperation({ summary: 'Delete a household (owner only)' })
  async remove(@Param('householdId') householdId: string, @CurrentUser('id') userId: string) {
    await this.householdsService.remove(householdId, userId);
  }

  @UseGuards(HouseholdMemberGuard)
  @Get(':householdId/members')
  @ApiOperation({ summary: 'List household members' })
  async listMembers(@Param('householdId') householdId: string) {
    return this.householdsService.listMembers(householdId);
  }

  @UseGuards(HouseholdMemberGuard, HouseholdRolesGuard)
  @HouseholdRoles(HouseholdRole.OWNER, HouseholdRole.ADMIN)
  @Patch(':householdId/members/:memberId/role')
  @ApiOperation({ summary: 'Change a member role' })
  async updateMemberRole(
    @Param('householdId') householdId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.householdsService.updateMemberRole(householdId, memberId, dto.role, userId);
  }

  @UseGuards(HouseholdMemberGuard, HouseholdRolesGuard)
  @HouseholdRoles(HouseholdRole.OWNER, HouseholdRole.ADMIN)
  @Delete(':householdId/members/:memberId')
  @ApiOperation({ summary: 'Remove a member from the household' })
  async removeMember(
    @Param('householdId') householdId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.householdsService.removeMember(householdId, memberId, userId);
  }

  @UseGuards(HouseholdMemberGuard)
  @Post(':householdId/leave')
  @ApiOperation({ summary: 'Leave a household' })
  async leave(@Param('householdId') householdId: string, @CurrentUser('id') userId: string) {
    await this.householdsService.leave(householdId, userId);
  }

  @UseGuards(HouseholdMemberGuard)
  @Get(':householdId/audit-logs')
  @ApiOperation({ summary: 'List audit logs for a household' })
  async auditLogs(@Param('householdId') householdId: string, @Query() query: PaginationQueryDto) {
    return this.auditService.findForHousehold(householdId, query);
  }
}
