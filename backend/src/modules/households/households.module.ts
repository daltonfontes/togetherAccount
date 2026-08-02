import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Household } from '@/database/entities/household.entity';
import { HouseholdMember } from '@/database/entities/household-member.entity';
import { Invite } from '@/database/entities/invite.entity';
import { Category } from '@/database/entities/category.entity';
import { AuditModule } from '@/modules/audit/audit.module';
import { UsersModule } from '@/modules/users/users.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { EmailModule } from '@/queues/email/email.module';
import { HouseholdsController } from './households.controller';
import { HouseholdsService } from './households.service';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import { HouseholdMemberGuard } from './guards/household-member.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Household, HouseholdMember, Invite, Category]),
    AuditModule,
    UsersModule,
    NotificationsModule,
    EmailModule,
  ],
  controllers: [HouseholdsController, InvitesController],
  providers: [HouseholdsService, InvitesService, HouseholdMemberGuard],
  exports: [HouseholdsService, InvitesService, HouseholdMemberGuard, TypeOrmModule],
})
export class HouseholdsModule {}
