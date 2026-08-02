import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@/database/entities/audit-log.entity';
import { AuditAction } from '@/common/enums';
import { PaginatedResultDto, PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export interface LogAuditInput {
  householdId?: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(input: LogAuditInput): Promise<void> {
    const entry = this.auditLogRepository.create(input);
    await this.auditLogRepository.save(entry);
  }

  async findForHousehold(
    householdId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResultDto<AuditLog>> {
    const [items, total] = await this.auditLogRepository.findAndCount({
      where: { householdId },
      order: { createdAt: 'DESC' },
      skip: query.skip,
      take: query.limit,
      relations: ['user'],
    });
    return new PaginatedResultDto(items, total, query.page, query.limit);
  }
}
