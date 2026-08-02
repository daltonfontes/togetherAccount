import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from '@/database/entities/goal.entity';
import { GoalContribution } from '@/database/entities/goal-contribution.entity';
import { HouseholdMember } from '@/database/entities/household-member.entity';
import { HouseholdsModule } from '@/modules/households/households.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Goal, GoalContribution, HouseholdMember]),
    HouseholdsModule,
    NotificationsModule,
  ],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
