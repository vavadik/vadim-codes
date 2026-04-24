import { createHash } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import type { SfUser } from 'src/auth/interfaces/sf-user.interface';

const NOW = new Date('2024-01-01T00:00:00.000Z');

const sfUser: SfUser = {
  sfUserId: 'sf-user-1',
  sfOrgId: 'sf-org-1',
  email: 'user@example.com',
  sfAccessToken: 'sf-access-token',
  sfInstanceUrl: 'https://na1.salesforce.com',
};

const makeSession = (overrides: Record<string, unknown> = {}) => ({
  id: 'session-1',
  sfUserId: sfUser.sfUserId,
  sfOrgId: sfUser.sfOrgId,
  email: sfUser.email,
  hashedToken: 'hashed-token',
  sfAccessToken: sfUser.sfAccessToken,
  sfInstanceUrl: sfUser.sfInstanceUrl,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { db: { session: Record<string, ReturnType<typeof vi.fn>> } };
  let jwtService: { sign: ReturnType<typeof vi.fn>; verify: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      db: {
        session: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          create: vi.fn().mockResolvedValue(makeSession()),
          findUnique: vi.fn(),
          update: vi.fn(),
        },
      },
    };

    jwtService = {
      sign: vi.fn().mockReturnValue('signed-jwt'),
      verify: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: vi.fn().mockReturnValue('test-jwt-secret') },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('handleSfCallback', () => {
    it('deletes existing sessions and creates a new one', async () => {
      await service.handleSfCallback(sfUser);

      expect(prisma.db.session.deleteMany).toHaveBeenCalledWith({
        where: { sfUserId: sfUser.sfUserId },
      });
      expect(prisma.db.session.create).toHaveBeenCalledOnce();
    });

    it('creates session with correct user fields', async () => {
      await service.handleSfCallback(sfUser);

      const [{ data }] = prisma.db.session.create.mock.calls[0] as unknown as [
        { data: Record<string, unknown> },
      ];
      expect(data.sfUserId).toBe(sfUser.sfUserId);
      expect(data.sfOrgId).toBe(sfUser.sfOrgId);
      expect(data.email).toBe(sfUser.email);
      expect(data.sfAccessToken).toBe(sfUser.sfAccessToken);
      expect(data.sfInstanceUrl).toBe(sfUser.sfInstanceUrl);
    });

    it('stores a hashed (not raw) refresh token in the session', async () => {
      const { rawToken } = await service.handleSfCallback(sfUser);

      const [{ data }] = prisma.db.session.create.mock.calls[0] as unknown as [
        { data: Record<string, unknown> },
      ];
      expect(data.hashedToken).toBe(hashToken(rawToken));
      expect(data.hashedToken).not.toBe(rawToken);
    });

    it('returns a signed JWT and a raw refresh token', async () => {
      const { jwt, rawToken } = await service.handleSfCallback(sfUser);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: sfUser.sfUserId, org: sfUser.sfOrgId, email: sfUser.email },
        { secret: 'test-jwt-secret', expiresIn: '15m' }
      );
      expect(jwt).toBe('signed-jwt');
      expect(typeof rawToken).toBe('string');
      expect(rawToken.length).toBeGreaterThan(0);
    });
  });

  describe('refreshTokens', () => {
    it('returns new jwt and rawToken when token is valid', async () => {
      const rawToken = 'valid-raw-token';
      const session = makeSession({ hashedToken: hashToken(rawToken) });
      prisma.db.session.findUnique.mockResolvedValue(session);
      prisma.db.session.update.mockResolvedValue(session);

      const result = await service.refreshTokens(rawToken);

      expect(prisma.db.session.findUnique).toHaveBeenCalledWith({
        where: { hashedToken: hashToken(rawToken) },
      });
      expect(result.jwt).toBe('signed-jwt');
      expect(typeof result.rawToken).toBe('string');
    });

    it('atomically rotates the token (update, not delete+create)', async () => {
      const rawToken = 'valid-raw-token';
      const session = makeSession({ hashedToken: hashToken(rawToken) });
      prisma.db.session.findUnique.mockResolvedValue(session);
      prisma.db.session.update.mockResolvedValue(session);

      const { rawToken: newRawToken } = await service.refreshTokens(rawToken);

      expect(prisma.db.session.update).toHaveBeenCalledWith({
        where: { id: session.id },
        data: expect.objectContaining({
          hashedToken: hashToken(newRawToken),
        }),
      });
      expect(prisma.db.session.deleteMany).not.toHaveBeenCalled();
      expect(prisma.db.session.create).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when token is not found', async () => {
      prisma.db.session.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('unknown-token')).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token')
      );
      expect(prisma.db.session.update).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when token is expired', async () => {
      const rawToken = 'expired-token';
      const session = makeSession({
        hashedToken: hashToken(rawToken),
        expiresAt: new Date(Date.now() - 1000),
      });
      prisma.db.session.findUnique.mockResolvedValue(session);

      await expect(service.refreshTokens(rawToken)).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token')
      );
      expect(prisma.db.session.update).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('deletes all sessions for the user', async () => {
      await service.logout(sfUser.sfUserId);

      expect(prisma.db.session.deleteMany).toHaveBeenCalledWith({
        where: { sfUserId: sfUser.sfUserId },
      });
    });

    it('is idempotent — does not throw when no sessions exist', async () => {
      prisma.db.session.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.logout('nonexistent-user')).resolves.toBeUndefined();
    });
  });
});
