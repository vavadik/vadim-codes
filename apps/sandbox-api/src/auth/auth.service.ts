import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { OAuthUser } from './interfaces/oauth-user.interface';

const JWT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async handleOAuthCallback(oauthUser: OAuthUser): Promise<string> {
    let user = await this.findOrCreateUser(oauthUser);

    await this.prisma.db.oAuthAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: oauthUser.provider,
          providerAccountId: oauthUser.providerAccountId,
        },
      },
      create: {
        userId: user.id,
        provider: oauthUser.provider,
        providerAccountId: oauthUser.providerAccountId,
        accessToken: oauthUser.accessToken,
        refreshToken: oauthUser.refreshToken,
      },
      update: {
        accessToken: oauthUser.accessToken,
        refreshToken: oauthUser.refreshToken,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };

    return this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: '30d',
    });
  }

  private async findOrCreateUser(oauthUser: OAuthUser): Promise<{
    id: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
  }> {
    const existing = await this.prisma.db.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: oauthUser.provider,
          providerAccountId: oauthUser.providerAccountId,
        },
      },
      include: { user: true },
    });

    if (existing) {
      return this.prisma.db.user.update({
        where: { id: existing.userId },
        data: {
          name: oauthUser.name,
          avatarUrl: oauthUser.avatarUrl,
          ...(oauthUser.email ? { email: oauthUser.email } : {}),
        },
      });
    }

    if (oauthUser.email) {
      const byEmail = await this.prisma.db.user.findUnique({
        where: { email: oauthUser.email },
      });
      if (byEmail) {
        return this.prisma.db.user.update({
          where: { id: byEmail.id },
          data: {
            name: oauthUser.name ?? byEmail.name,
            avatarUrl: oauthUser.avatarUrl ?? byEmail.avatarUrl,
          },
        });
      }
    }

    return this.prisma.db.user.create({
      data: {
        email: oauthUser.email,
        name: oauthUser.name,
        avatarUrl: oauthUser.avatarUrl,
      },
    });
  }

  cookieOptions(secure: boolean): {
    httpOnly: boolean;
    sameSite: 'lax';
    path: string;
    secure: boolean;
    maxAge: number;
  } {
    return {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure,
      maxAge: JWT_TTL_MS,
    };
  }
}
