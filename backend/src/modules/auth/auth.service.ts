import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { AppConfig } from '@/config/configuration';
import { RefreshToken } from '@/database/entities/refresh-token.entity';
import { MagicLinkToken } from '@/database/entities/magic-link-token.entity';
import { User } from '@/database/entities/user.entity';
import { AuditService } from '@/modules/audit/audit.service';
import { AuditAction } from '@/common/enums';
import { UsersService } from '@/modules/users/users.service';
import { EmailQueueService } from '@/queues/email/email-queue.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './types/jwt-payload.interface';
import { GoogleProfile } from './types/google-profile.interface';

interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
}

const MAGIC_LINK_EXPIRY_MINUTES = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
    private readonly auditService: AuditService,
    private readonly emailQueueService: EmailQueueService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(MagicLinkToken)
    private readonly magicLinkTokenRepository: Repository<MagicLinkToken>,
  ) {}

  async register(dto: RegisterDto, meta: RequestMetadata): Promise<AuthResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      fullName: dto.fullName,
    });

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.CREATE,
      entityType: 'User',
      entityId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return this.issueTokens(user, meta);
  }

  async login(dto: LoginDto, meta: RequestMetadata): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (!user || !user.isActive || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.updateLastLogin(user.id);

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return this.issueTokens(user, meta);
  }

  async loginWithGoogle(profile: GoogleProfile, meta: RequestMetadata): Promise<AuthResponseDto> {
    const email = profile.email.toLowerCase();

    let user = await this.usersService.findByGoogleId(profile.googleId);
    if (!user) {
      const existingByEmail = await this.usersService.findByEmail(email);
      user = existingByEmail
        ? await this.usersService.linkGoogleAccount(
            existingByEmail.id,
            profile.googleId,
            profile.avatarUrl,
          )
        : await this.usersService.create({
            email,
            fullName: profile.fullName,
            avatarUrl: profile.avatarUrl,
            googleId: profile.googleId,
            emailVerified: true,
          });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    await this.usersService.updateLastLogin(user.id);

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return this.issueTokens(user, meta);
  }

  async requestMagicLink(rawEmail: string): Promise<void> {
    const email = rawEmail.toLowerCase();
    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

    await this.magicLinkTokenRepository.save(
      this.magicLinkTokenRepository.create({
        email,
        tokenHash: this.hashMagicLinkToken(rawToken),
        expiresAt,
      }),
    );

    const frontendUrl = this.configService.get('frontendUrl', { infer: true })!;
    const link = `${frontendUrl}/auth/magic-link?token=${rawToken}`;

    await this.emailQueueService.queueMagicLinkEmail({
      to: email,
      link,
      expiresInMinutes: MAGIC_LINK_EXPIRY_MINUTES,
    });
  }

  async verifyMagicLink(rawToken: string, meta: RequestMetadata): Promise<AuthResponseDto> {
    const tokenHash = this.hashMagicLinkToken(rawToken);
    const record = await this.magicLinkTokenRepository.findOne({
      where: { tokenHash, consumedAt: IsNull(), expiresAt: MoreThan(new Date()) },
    });

    if (!record) {
      throw new UnauthorizedException('This sign-in link is invalid or has expired');
    }

    // Mark consumed before issuing tokens so a second request with the same
    // link (e.g. an email client prefetching it) can't also log in with it.
    await this.magicLinkTokenRepository.update(record.id, { consumedAt: new Date() });

    let user = await this.usersService.findByEmail(record.email);
    if (!user) {
      user = await this.usersService.create({
        email: record.email,
        fullName: record.email.split('@')[0],
        emailVerified: true,
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    await this.usersService.updateLastLogin(user.id);

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return this.issueTokens(user, meta);
  }

  private hashMagicLinkToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  async refresh(
    userId: string,
    tokenId: string,
    rawToken: string,
    meta: RequestMetadata,
  ): Promise<AuthResponseDto> {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { id: tokenId, userId, revoked: false, expiresAt: MoreThan(new Date()) },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const matches = await argon2.verify(storedToken.tokenHash, rawToken);
    if (!matches) {
      await this.refreshTokenRepository.update({ userId }, { revoked: true });
      throw new UnauthorizedException('Refresh token reuse detected, all sessions revoked');
    }

    await this.refreshTokenRepository.update(storedToken.id, { revoked: true });

    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.issueTokens(user, meta);
  }

  async logout(userId: string, tokenId?: string): Promise<void> {
    if (tokenId) {
      await this.refreshTokenRepository.update({ id: tokenId, userId }, { revoked: true });
      return;
    }
    await this.refreshTokenRepository.update({ userId }, { revoked: true });
  }

  private async issueTokens(user: User, meta: RequestMetadata): Promise<AuthResponseDto> {
    const jwtConfig = this.configService.get('jwt', { infer: true })!;
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtConfig.accessExpiresIn,
    });

    const tokenId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + this.parseExpiry(jwtConfig.refreshExpiresIn));

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, tokenId },
      { secret: jwtConfig.refreshSecret, expiresIn: jwtConfig.refreshExpiresIn },
    );

    const refreshTokenHash = await argon2.hash(refreshToken);

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        id: tokenId,
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      }),
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        themePreference: user.themePreference,
      },
    };
  }

  private parseExpiry(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const amount = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return amount * multipliers[unit];
  }
}
