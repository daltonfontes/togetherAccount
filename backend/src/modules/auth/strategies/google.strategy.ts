import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AppConfig } from '@/config/configuration';
import { GoogleProfile } from '../types/google-profile.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService<AppConfig>) {
    const google = configService.get('google', { infer: true })!;
    super({
      clientID: google.clientId,
      clientSecret: google.clientSecret,
      callbackURL: google.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;
    const emailVerified = profile.emails?.[0]?.verified;

    if (!email || emailVerified === false) {
      done(new UnauthorizedException('Google account has no verified email'), false);
      return;
    }

    const result: GoogleProfile = {
      googleId: profile.id,
      email,
      fullName: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    };
    done(null, result);
  }
}
