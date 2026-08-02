import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { HouseholdMemberGuard } from '@/modules/households/guards/household-member.guard';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@ApiTags('bank-accounts')
@ApiBearerAuth()
@UseGuards(HouseholdMemberGuard)
@Controller('households/:householdId/bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a bank account' })
  async create(
    @Param('householdId') householdId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBankAccountDto,
  ) {
    return this.bankAccountsService.create(householdId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bank accounts' })
  async findAll(@Param('householdId') householdId: string) {
    return this.bankAccountsService.findAll(householdId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bank account' })
  async findOne(@Param('householdId') householdId: string, @Param('id') id: string) {
    return this.bankAccountsService.findOneOrFail(householdId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bank account' })
  async update(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateBankAccountDto,
  ) {
    return this.bankAccountsService.update(householdId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bank account' })
  async remove(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.bankAccountsService.remove(householdId, id, userId);
  }
}
