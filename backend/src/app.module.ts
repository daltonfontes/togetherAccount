import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration, { AppConfig } from '@/config/configuration';
import { validationSchema } from '@/config/validation';
import { DatabaseModule } from '@/database/database.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { MetricsModule } from '@/observability/metrics/metrics.module';
import { MetricsInterceptor } from '@/observability/metrics/metrics.interceptor';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { HouseholdsModule } from '@/modules/households/households.module';
import { BankAccountsModule } from '@/modules/bank-accounts/bank-accounts.module';
import { CreditCardsModule } from '@/modules/credit-cards/credit-cards.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { TransactionsModule } from '@/modules/transactions/transactions.module';
import { BudgetsModule } from '@/modules/budgets/budgets.module';
import { GoalsModule } from '@/modules/goals/goals.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { ReportsModule } from '@/modules/reports/reports.module';
import { HealthModule } from '@/modules/health/health.module';

import { BullMqRootModule } from '@/queues/bullmq-root.module';
import { EmailModule } from '@/queues/email/email.module';
import { RecurringTransactionsModule } from '@/queues/recurring-transactions/recurring-transactions.module';
import { AlertsModule } from '@/queues/alerts/alerts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: false },
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const throttle = configService.get('throttle', { infer: true })!;
        return [{ ttl: throttle.ttl * 1000, limit: throttle.limit }];
      },
    }),
    DatabaseModule,
    MetricsModule,
    BullMqRootModule,

    AuthModule,
    UsersModule,
    HouseholdsModule,
    BankAccountsModule,
    CreditCardsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    NotificationsModule,
    AuditModule,
    ReportsModule,
    HealthModule,

    EmailModule,
    RecurringTransactionsModule,
    AlertsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector) => new ClassSerializerInterceptor(reflector),
      inject: [Reflector],
    },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
})
export class AppModule {}
