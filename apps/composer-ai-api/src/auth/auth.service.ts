import { createHash, randomBytes } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { SfUser } from './interfaces/sf-user.interface';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async handleSfCallback(sfUser: SfUser): Promise<{ jwt: string; rawToken: string }> {
    const { jwt, rawToken, hashedToken } = this.generateTokens(sfUser);

    // Single session per user: replace any existing session
    await this.prisma.db.session.deleteMany({ where: { sfUserId: sfUser.sfUserId } });

    await this.prisma.db.session.create({
      data: {
        sfUserId: sfUser.sfUserId,
        sfOrgId: sfUser.sfOrgId,
        email: sfUser.email,
        hashedToken,
        sfAccessToken: sfUser.sfAccessToken,
        sfInstanceUrl: sfUser.sfInstanceUrl,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return { jwt, rawToken };
  }

  async refreshTokens(rawRefreshToken: string): Promise<{ jwt: string; rawToken: string }> {
    const hashedToken = this.hashToken(rawRefreshToken);

    const session = await this.prisma.db.session.findUnique({ where: { hashedToken } });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const {
      jwt,
      rawToken,
      hashedToken: newHashedToken,
    } = this.generateTokens({
      sfUserId: session.sfUserId,
      sfOrgId: session.sfOrgId,
      email: session.email,
    });

    // Atomic rotation: update the existing session row
    await this.prisma.db.session.update({
      where: { id: session.id },
      data: {
        hashedToken: newHashedToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return { jwt, rawToken };
  }

  async logout(sfUserId: string): Promise<void> {
    await this.prisma.db.session.deleteMany({ where: { sfUserId } });
  }

  private generateTokens(sfUser: Pick<SfUser, 'sfUserId' | 'sfOrgId' | 'email'>): {
    jwt: string;
    rawToken: string;
    hashedToken: string;
  } {
    const payload: JwtPayload = {
      sub: sfUser.sfUserId,
      org: sfUser.sfOrgId,
      email: sfUser.email,
    };

    const jwt = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(rawToken);

    return { jwt, rawToken, hashedToken };
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
