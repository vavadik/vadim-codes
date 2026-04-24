import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { SfUser } from 'src/auth/interfaces/sf-user.interface';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

const sfUser: SfUser = {
  sfUserId: 'sf-user-1',
  sfOrgId: 'sf-org-1',
  email: 'user@example.com',
  sfAccessToken: 'sf-access-token',
  sfInstanceUrl: 'https://na1.salesforce.com',
};

const jwtPayload: JwtPayload = {
  sub: sfUser.sfUserId,
  org: sfUser.sfOrgId,
  email: sfUser.email,
};

function makeRes() {
  return {
    cookie: vi.fn(),
    redirect: vi.fn(),
  };
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    handleSfCallback: ReturnType<typeof vi.fn>;
    refreshTokens: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      handleSfCallback: vi.fn().mockResolvedValue({ jwt: 'test-jwt', rawToken: 'test-raw-token' }),
      refreshTokens: vi.fn().mockResolvedValue({ jwt: 'new-jwt', rawToken: 'new-raw-token' }),
      logout: vi.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue(undefined),
            getOrThrow: vi.fn().mockReturnValue('http://localhost:5173'),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthController);
  });

  describe('callback', () => {
    it('calls handleSfCallback with the SF user from req.user', async () => {
      const req = { user: sfUser } as any;
      const res = makeRes();

      await controller.callback(req, res as any);

      expect(authService.handleSfCallback).toHaveBeenCalledWith(sfUser);
    });

    it('sets access_token and refresh_token httpOnly cookies', async () => {
      const req = { user: sfUser } as any;
      const res = makeRes();

      await controller.callback(req, res as any);

      const cookieCalls = res.cookie.mock.calls.map(([name]: [string]) => name);
      expect(cookieCalls).toContain('access_token');
      expect(cookieCalls).toContain('refresh_token');

      const [, , accessOptions] = res.cookie.mock.calls.find(
        ([n]: [string]) => n === 'access_token'
      )!;
      expect(accessOptions.httpOnly).toBe(true);
      expect(accessOptions.sameSite).toBe('lax');

      const [, , refreshOptions] = res.cookie.mock.calls.find(
        ([n]: [string]) => n === 'refresh_token'
      )!;
      expect(refreshOptions.httpOnly).toBe(true);
    });

    it('redirects to SF_AUTH_SUCCESS_REDIRECT after setting cookies', async () => {
      const req = { user: sfUser } as any;
      const res = makeRes();

      await controller.callback(req, res as any);

      expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173');
    });
  });

  describe('refresh', () => {
    it('calls refreshTokens with the refresh_token cookie value', async () => {
      const req = { cookies: { refresh_token: 'test-raw-token' } } as any;
      const res = makeRes();

      await controller.refresh(req, res as any);

      expect(authService.refreshTokens).toHaveBeenCalledWith('test-raw-token');
    });

    it('sets new access_token and refresh_token cookies', async () => {
      const req = { cookies: { refresh_token: 'test-raw-token' } } as any;
      const res = makeRes();

      await controller.refresh(req, res as any);

      const cookieCalls = res.cookie.mock.calls.map(([name]: [string]) => name);
      expect(cookieCalls).toContain('access_token');
      expect(cookieCalls).toContain('refresh_token');
    });

    it('returns { message: "ok" }', async () => {
      const req = { cookies: { refresh_token: 'test-raw-token' } } as any;
      const res = makeRes();

      const result = await controller.refresh(req, res as any);

      expect(result).toEqual({ message: 'ok' });
    });

    it('throws UnauthorizedException when refresh_token cookie is absent', async () => {
      const req = { cookies: {} } as any;
      const res = makeRes();

      await expect(controller.refresh(req, res as any)).rejects.toThrow(
        new UnauthorizedException('No refresh token')
      );
      expect(authService.refreshTokens).not.toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('returns sfUserId, sfOrgId, email from the JWT payload', () => {
      const req = { user: jwtPayload } as any;

      const result = controller.me(req);

      expect(result).toEqual({
        sfUserId: jwtPayload.sub,
        sfOrgId: jwtPayload.org,
        email: jwtPayload.email,
      });
    });
  });

  describe('logout', () => {
    it('calls logout with the user id from JWT payload', async () => {
      const req = { user: jwtPayload } as any;
      const res = makeRes();

      await controller.logout(req, res as any);

      expect(authService.logout).toHaveBeenCalledWith(jwtPayload.sub);
    });

    it('clears both cookies by setting maxAge to 0', async () => {
      const req = { user: jwtPayload } as any;
      const res = makeRes();

      await controller.logout(req, res as any);

      const cleared = res.cookie.mock.calls.map(
        ([name, , opts]: [string, string, { maxAge: number }]) => ({
          name,
          maxAge: opts.maxAge,
        })
      );
      expect(cleared).toContainEqual({ name: 'access_token', maxAge: 0 });
      expect(cleared).toContainEqual({ name: 'refresh_token', maxAge: 0 });
    });

    it('returns { message: "logged out" }', async () => {
      const req = { user: jwtPayload } as any;
      const res = makeRes();

      const result = await controller.logout(req, res as any);

      expect(result).toEqual({ message: 'logged out' });
    });
  });
});
