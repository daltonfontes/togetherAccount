import { CanActivate, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/config/configuration';

/**
 * Runs before AuthGuard('google') so an unconfigured server responds with a
 * clear error instead of Passport throwing "Unknown authentication strategy
 * google" — which happens because GoogleStrategy is only registered when
 * credentials are present (see AuthModule).
 */
@Injectable()
export class GoogleOAuthEnabledGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<AppConfig>) {}

  canActivate(): boolean {
    const google = this.configService.get('google', { infer: true });
    if (!google?.clientId || !google?.clientSecret || !google?.callbackUrl) {
      throw new ServiceUnavailableException('Google sign-in is not configured on this server');
    }
    return true;
  }
}
