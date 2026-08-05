import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { RefreshToken } from '@/database/entities/refresh-token.entity';
import { MagicLinkToken } from '@/database/entities/magic-link-token.entity';
import { User } from '@/database/entities/user.entity';
import { AuditService } from '@/modules/audit/audit.service';
import { UsersService } from '@/modules/users/users.service';
import { EmailQueueService } from '@/queues/email/email-queue.service';
import { AuthService } from './auth.service';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let emailQueueService: jest.Mocked<EmailQueueService>;
  let refreshTokenRepository: {
    save: jest.Mock;
    create: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
  };
  let magicLinkTokenRepository: {
    save: jest.Mock;
    create: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    refreshTokenRepository = {
      save: jest.fn((entity) => Promise.resolve(entity)),
      create: jest.fn((entity) => entity),
      findOne: jest.fn(),
      update: jest.fn(),
    };
    magicLinkTokenRepository = {
      save: jest.fn((entity) => Promise.resolve(entity)),
      create: jest.fn((entity) => entity),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findByGoogleId: jest.fn(),
            linkGoogleAccount: jest.fn(),
            create: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('signed-token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'frontendUrl'
                ? 'http://localhost:3000'
                : {
                    accessSecret: 'access-secret',
                    accessExpiresIn: '15m',
                    refreshSecret: 'refresh-secret',
                    refreshExpiresIn: '7d',
                  },
            ),
          },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
        {
          provide: EmailQueueService,
          useValue: { queueInviteEmail: jest.fn(), queueMagicLinkEmail: jest.fn() },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepository,
        },
        {
          provide: getRepositoryToken(MagicLinkToken),
          useValue: magicLinkTokenRepository,
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    emailQueueService = module.get(EmailQueueService);
  });

  describe('register', () => {
    it('throws ConflictException when the email is already registered', async () => {
      usersService.findByEmail.mockResolvedValue({ id: '1' } as User);

      await expect(
        service.register(
          { email: 'taken@example.com', password: 'Passw0rd!', fullName: 'Jane' },
          {},
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('creates a user and issues tokens on successful registration', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersService.create.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        fullName: 'Jane',
        themePreference: 'system',
      } as User);

      const result = await service.register(
        { email: 'jane@example.com', password: 'Passw0rd!', fullName: 'Jane' },
        { ipAddress: '127.0.0.1' },
      );

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane@example.com', passwordHash: 'hashed-password' }),
      );
      expect(result.accessToken).toBe('signed-token');
      expect(result.user.email).toBe('jane@example.com');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for a non-existent user', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@example.com', password: 'whatever' }, {}),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        isActive: true,
        passwordHash: 'hashed',
      } as User);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'jane@example.com', password: 'wrong' }, {}),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        fullName: 'Jane',
        isActive: true,
        passwordHash: 'hashed',
        themePreference: 'system',
      } as User);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'jane@example.com', password: 'Passw0rd!' }, {});

      expect(usersService.updateLastLogin).toHaveBeenCalledWith('user-1');
      expect(result.accessToken).toBe('signed-token');
    });

    it('throws UnauthorizedException for a Google-only account (no password set)', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        isActive: true,
        passwordHash: undefined,
      } as User);

      await expect(
        service.login({ email: 'google-user@example.com', password: 'whatever' }, {}),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('loginWithGoogle', () => {
    const profile = {
      googleId: 'google-123',
      email: 'jane@example.com',
      fullName: 'Jane',
      avatarUrl: 'https://example.com/avatar.png',
    };

    it('reuses an existing user already linked to this Google account', async () => {
      usersService.findByGoogleId.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        fullName: 'Jane',
        isActive: true,
        themePreference: 'system',
      } as User);

      const result = await service.loginWithGoogle(profile, {});

      expect(usersService.findByEmail).not.toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
      expect(usersService.updateLastLogin).toHaveBeenCalledWith('user-1');
      expect(result.accessToken).toBe('signed-token');
    });

    it('links the Google account to an existing password-based user with the same email', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        fullName: 'Jane',
        isActive: true,
        themePreference: 'system',
      } as User);
      usersService.linkGoogleAccount.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        fullName: 'Jane',
        isActive: true,
        themePreference: 'system',
      } as User);

      const result = await service.loginWithGoogle(profile, {});

      expect(usersService.linkGoogleAccount).toHaveBeenCalledWith(
        'user-1',
        'google-123',
        profile.avatarUrl,
      );
      expect(usersService.create).not.toHaveBeenCalled();
      expect(result.accessToken).toBe('signed-token');
    });

    it('creates a new passwordless user when no account matches by googleId or email', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 'user-2',
        email: 'jane@example.com',
        fullName: 'Jane',
        isActive: true,
        themePreference: 'system',
      } as User);

      const result = await service.loginWithGoogle(profile, {});

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane@example.com', googleId: 'google-123' }),
      );
      expect(usersService.create.mock.calls[0][0]).not.toHaveProperty('passwordHash');
      expect(result.accessToken).toBe('signed-token');
    });

    it('throws UnauthorizedException for an inactive account', async () => {
      usersService.findByGoogleId.mockResolvedValue({
        id: 'user-1',
        isActive: false,
      } as User);

      await expect(service.loginWithGoogle(profile, {})).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('rejects when no matching stored token exists', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh('user-1', 'token-1', 'raw', {})).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('revokes all sessions and rejects on token reuse detection', async () => {
      refreshTokenRepository.findOne.mockResolvedValue({
        id: 'token-1',
        userId: 'user-1',
        tokenHash: 'stored-hash',
      });
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('user-1', 'token-1', 'raw', {})).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: 'user-1' },
        { revoked: true },
      );
    });
  });

  describe('requestMagicLink', () => {
    it('stores a hashed token and queues an email with a link to the frontend', async () => {
      await service.requestMagicLink('Jane@Example.com');

      expect(magicLinkTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane@example.com' }),
      );
      const saved = magicLinkTokenRepository.save.mock.calls[0][0];
      expect(saved.tokenHash).toMatch(/^[0-9a-f]{64}$/); // sha256 hex digest
      const linkArg = emailQueueService.queueMagicLinkEmail.mock.calls[0][0].link as string;
      const rawTokenInLink = new URL(linkArg).searchParams.get('token')!;
      expect(saved.tokenHash).not.toBe(rawTokenInLink); // stored hashed, not the raw emailed token

      expect(emailQueueService.queueMagicLinkEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'jane@example.com',
          link: expect.stringContaining('http://localhost:3000/auth/magic-link?token='),
          expiresInMinutes: 15,
        }),
      );
    });
  });

  describe('verifyMagicLink', () => {
    it('throws UnauthorizedException when the token is invalid, expired, or already used', async () => {
      magicLinkTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyMagicLink('some-token', {})).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('logs in an existing user and marks the token consumed', async () => {
      magicLinkTokenRepository.findOne.mockResolvedValue({
        id: 'token-1',
        email: 'jane@example.com',
      });
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        fullName: 'Jane',
        isActive: true,
        themePreference: 'system',
      } as User);

      const result = await service.verifyMagicLink('some-token', {});

      expect(magicLinkTokenRepository.update).toHaveBeenCalledWith(
        'token-1',
        expect.objectContaining({ consumedAt: expect.any(Date) }),
      );
      expect(usersService.create).not.toHaveBeenCalled();
      expect(usersService.updateLastLogin).toHaveBeenCalledWith('user-1');
      expect(result.accessToken).toBe('signed-token');
    });

    it('creates a new passwordless user when no account matches the email', async () => {
      magicLinkTokenRepository.findOne.mockResolvedValue({
        id: 'token-1',
        email: 'newperson@example.com',
      });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 'user-2',
        email: 'newperson@example.com',
        fullName: 'newperson',
        isActive: true,
        themePreference: 'system',
      } as User);

      const result = await service.verifyMagicLink('some-token', {});

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'newperson@example.com', fullName: 'newperson' }),
      );
      expect(usersService.create.mock.calls[0][0]).not.toHaveProperty('passwordHash');
      expect(result.accessToken).toBe('signed-token');
    });

    it('throws UnauthorizedException for an inactive account', async () => {
      magicLinkTokenRepository.findOne.mockResolvedValue({
        id: 'token-1',
        email: 'jane@example.com',
      });
      usersService.findByEmail.mockResolvedValue({ id: 'user-1', isActive: false } as User);

      await expect(service.verifyMagicLink('some-token', {})).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
