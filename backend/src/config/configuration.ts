export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  apiVersion: string;
  corsOrigins: string[];
  frontendUrl: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  google: {
    clientId?: string;
    clientSecret?: string;
    callbackUrl?: string;
  };
  throttle: {
    ttl: number;
    limit: number;
  };
  otel: {
    exporterEndpoint: string;
    serviceName: string;
  };
  logLevel: string;
}

export default (): AppConfig => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME || 'together_account',
    password: process.env.DB_PASSWORD || 'together_account',
    database: process.env.DB_DATABASE || 'together_account',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || undefined,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || undefined,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || undefined,
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
  otel: {
    exporterEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    serviceName: process.env.OTEL_SERVICE_NAME || 'together-account-api',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
});
