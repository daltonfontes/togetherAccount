import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '@/config/configuration';
import { RefreshToken } from '@/database/entities/refresh-token.entity';
import { UsersModule } from '@/modules/users/users.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleOAuthEnabledGuard } from './guards/google-oauth-enabled.guard';

// GoogleStrategy's constructor calls passport-google-oauth20's Strategy
// constructor, which throws synchronously if clientID/clientSecret are
// missing. Only register it when Google sign-in is actually configured, so
// deployments that don't set these env vars still boot; GoogleOAuthEnabledGuard
// returns a clean 503 on the google/google/callback routes instead.
const googleOAuthProviders =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
    ? [GoogleStrategy]
    : [];

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule,
    UsersModule,
    AuditModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const jwtConfig = configService.get('jwt', { infer: true })!;
        return {
          secret: jwtConfig.accessSecret,
          signOptions: { expiresIn: jwtConfig.accessExpiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleOAuthEnabledGuard,
    ...googleOAuthProviders,
  ],
  exports: [AuthService],
})
export class AuthModule {}
