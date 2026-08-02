import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from '@/config/configuration';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const redis = configService.get('redis', { infer: true })!;
        return {
          connection: {
            host: redis.host,
            port: redis.port,
            password: redis.password,
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: 100,
            removeOnFail: 500,
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class BullMqRootModule {}
