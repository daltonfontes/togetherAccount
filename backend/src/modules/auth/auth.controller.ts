import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AppConfig } from '@/config/configuration';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GoogleOAuthEnabledGuard } from './guards/google-oauth-enabled.guard';
import { GoogleProfile } from './types/google-profile.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Create a new user account' })
  async register(@Body() dto: RegisterDto, @Req() req: Request): Promise<AuthResponseDto> {
    return this.authService.register(dto, this.extractMeta(req));
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Authenticate with email and password' })
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthResponseDto> {
    return this.authService.login(dto, this.extractMeta(req));
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Exchange a refresh token for a new token pair' })
  async refresh(
    @Body() _dto: RefreshTokenDto,
    @Req() req: Request & { user: { sub: string; tokenId: string; refreshToken: string } },
  ): Promise<AuthResponseDto> {
    const { sub, tokenId, refreshToken } = req.user;
    return this.authService.refresh(sub, tokenId, refreshToken, this.extractMeta(req));
  }

  @Public()
  @UseGuards(GoogleOAuthEnabledGuard, AuthGuard('google'))
  @Get('google')
  @ApiExcludeEndpoint()
  googleLogin(): void {
    // Guard redirects to Google's consent screen; this body never runs.
  }

  @Public()
  @UseGuards(GoogleOAuthEnabledGuard, AuthGuard('google'))
  @Get('google/callback')
  @ApiExcludeEndpoint()
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const tokens = await this.authService.loginWithGoogle(
      req.user as GoogleProfile,
      this.extractMeta(req),
    );

    const frontendUrl = this.configService.get('frontendUrl', { infer: true })!;
    const redirectUrl = new URL('/auth/callback', frontendUrl);
    redirectUrl.hash = new URLSearchParams({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }).toString();

    res.redirect(redirectUrl.toString());
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  @ApiOperation({ summary: 'Revoke the current refresh token session' })
  async logout(@CurrentUser('id') userId: string): Promise<void> {
    await this.authService.logout(userId);
  }

  private extractMeta(req: Request) {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
