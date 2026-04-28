import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-github2';
import type { OAuthUser } from '../interfaces/oauth-user.interface';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string | null,
    profile: Profile,
    done: (err: Error | null, user?: OAuthUser) => void
  ): void {
    const email = profile.emails?.[0]?.value ?? null;

    const avatarUrl = profile.photos?.[0]?.value ?? null;

    const user: OAuthUser = {
      provider: 'github',
      providerAccountId: profile.id,
      email,
      name: profile.displayName || profile.username || null,
      avatarUrl,
      accessToken,
      refreshToken: refreshToken ?? null,
    };

    done(null, user);
  }
}
