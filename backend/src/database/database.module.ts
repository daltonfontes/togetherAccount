import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '@/config/configuration';
import { entities } from './entities.list';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const db = configService.get('database', { infer: true })!;
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          synchronize: db.synchronize,
          logging: db.logging,
          ssl: db.ssl ? { rejectUnauthorized: false } : false,
          entities,
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          migrationsRun: false,
          autoLoadEntities: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
