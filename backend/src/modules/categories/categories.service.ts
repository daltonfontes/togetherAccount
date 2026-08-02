import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '@/database/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(householdId: string, dto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.save(this.categoryRepository.create({ ...dto, householdId }));
  }

  async findAll(householdId: string, type?: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: type ? { householdId, type: type as any } : { householdId },
      order: { name: 'ASC' },
    });
  }

  async findOneOrFail(householdId: string, id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id, householdId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(householdId: string, id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOneOrFail(householdId, id);
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(householdId: string, id: string): Promise<void> {
    const category = await this.findOneOrFail(householdId, id);
    if (category.isDefault) {
      throw new BadRequestException('Default categories cannot be deleted');
    }
    await this.categoryRepository.remove(category);
  }
}
