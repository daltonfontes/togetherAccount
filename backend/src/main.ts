import './observability/tracing-bootstrap';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';
import { createWinstonLogger } from './observability/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createWinstonLogger(),
  });

  const configService = app.get(ConfigService<AppConfig>);
  const apiPrefix = configService.get('apiPrefix', { infer: true })!;
  const corsOrigins = configService.get('corsOrigins', { infer: true })!;
  const port = configService.get('port', { infer: true })!;

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Together Account API')
    .setDescription('API for shared household finance management')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('users')
    .addTag('households')
    .addTag('invites')
    .addTag('bank-accounts')
    .addTag('credit-cards')
    .addTag('categories')
    .addTag('transactions')
    .addTag('budgets')
    .addTag('goals')
    .addTag('notifications')
    .addTag('reports')
    .addTag('audit')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Together Account API running on port ${port} (prefix: /${apiPrefix})`);
}

bootstrap();
