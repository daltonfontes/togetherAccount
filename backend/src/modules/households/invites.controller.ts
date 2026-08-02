import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { HouseholdRole } from '@/common/enums';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { HouseholdMemberGuard } from './guards/household-member.guard';
import { HouseholdRolesGuard } from './guards/household-roles.guard';
import { HouseholdRoles } from './decorators/household-roles.decorator';

@ApiTags('invites')
@ApiBearerAuth()
@Controller()
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @UseGuards(HouseholdMemberGuard, HouseholdRolesGuard)
  @HouseholdRoles(HouseholdRole.OWNER, HouseholdRole.ADMIN)
  @Post('households/:householdId/invites')
  @ApiOperation({ summary: 'Invite a person to join the household' })
  async create(
    @Param('householdId') householdId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInviteDto,
  ) {
    return this.invitesService.create(householdId, userId, dto);
  }

  @UseGuards(HouseholdMemberGuard)
  @Get('households/:householdId/invites')
  @ApiOperation({ summary: 'List invites for a household' })
  async listForHousehold(@Param('householdId') householdId: string) {
    return this.invitesService.listForHousehold(householdId);
  }

  @UseGuards(HouseholdMemberGuard, HouseholdRolesGuard)
  @HouseholdRoles(HouseholdRole.OWNER, HouseholdRole.ADMIN)
  @Delete('households/:householdId/invites/:inviteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a pending invite' })
  async revoke(
    @Param('householdId') householdId: string,
    @Param('inviteId') inviteId: string,
  ) {
    await this.invitesService.revoke(householdId, inviteId);
  }

  @Get('invites/me')
  @ApiOperation({ summary: 'List invites addressed to the current user' })
  async myInvites(@CurrentUser('email') email: string) {
    return this.invitesService.listForUser(email);
  }

  @Post('invites/:token/accept')
  @ApiOperation({ summary: 'Accept an invite' })
  async accept(
    @Param('token') token: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
  ) {
    return this.invitesService.accept(token, userId, email);
  }

  @Post('invites/:token/decline')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Decline an invite' })
  async decline(@Param('token') token: string, @CurrentUser('email') email: string) {
    await this.invitesService.decline(token, email);
  }
}
