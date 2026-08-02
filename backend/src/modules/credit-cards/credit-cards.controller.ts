import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { HouseholdMemberGuard } from '@/modules/households/guards/household-member.guard';
import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';

@ApiTags('credit-cards')
@ApiBearerAuth()
@UseGuards(HouseholdMemberGuard)
@Controller('households/:householdId/credit-cards')
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a credit card' })
  async create(
    @Param('householdId') householdId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCreditCardDto,
  ) {
    return this.creditCardsService.create(householdId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List credit cards' })
  async findAll(@Param('householdId') householdId: string) {
    return this.creditCardsService.findAll(householdId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a credit card' })
  async findOne(@Param('householdId') householdId: string, @Param('id') id: string) {
    return this.creditCardsService.findOneOrFail(householdId, id);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Get the current invoice for a credit card' })
  async getInvoice(@Param('householdId') householdId: string, @Param('id') id: string) {
    return this.creditCardsService.getCurrentInvoice(householdId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a credit card' })
  async update(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCreditCardDto,
  ) {
    return this.creditCardsService.update(householdId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a credit card' })
  async remove(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.creditCardsService.remove(householdId, id, userId);
  }
}
