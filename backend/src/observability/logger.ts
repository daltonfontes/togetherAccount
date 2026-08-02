import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';

const isProduction = process.env.NODE_ENV === 'production';

export const createWinstonLogger = () =>
  WinstonModule.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
      new winston.transports.Console({
        format: isProduction
          ? winston.format.combine(winston.format.timestamp(), winston.format.json())
          : winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              nestWinstonModuleUtilities.format.nestLike('TogetherAccount', {
                colors: true,
                prettyPrint: true,
              }),
            ),
      }),
    ],
  });
