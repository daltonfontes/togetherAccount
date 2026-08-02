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
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { HouseholdMemberGuard } from '@/modules/households/guards/household-member.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(HouseholdMemberGuard)
@Controller('households/:householdId/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  async create(
    @Param('householdId') householdId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(householdId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions with filters' })
  async findAll(@Param('householdId') householdId: string, @Query() query: QueryTransactionsDto) {
    return this.transactionsService.findAll(householdId, query);
  }

  @Get('pending-splits')
  @ApiOperation({ summary: 'List pending splits owed by the current user' })
  async pendingSplits(
    @Param('householdId') householdId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.transactionsService.getPendingSplitsForUser(householdId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction' })
  async findOne(@Param('householdId') householdId: string, @Param('id') id: string) {
    return this.transactionsService.findOneOrFail(householdId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  async update(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(householdId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  async remove(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.transactionsService.remove(householdId, id, userId);
  }

  @Patch(':id/splits/:splitId/settle')
  @ApiOperation({ summary: 'Mark a transaction split as settled' })
  async settleSplit(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @Param('splitId') splitId: string,
  ) {
    return this.transactionsService.settleSplit(householdId, id, splitId);
  }
}
