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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(HouseholdMemberGuard)
@Controller('households/:householdId/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  async create(@Param('householdId') householdId: string, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(householdId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List categories' })
  async findAll(@Param('householdId') householdId: string, @Query('type') type?: string) {
    return this.categoriesService.findAll(householdId, type);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  async update(
    @Param('householdId') householdId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(householdId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  async remove(@Param('householdId') householdId: string, @Param('id') id: string) {
    await this.categoriesService.remove(householdId, id);
  }
}
