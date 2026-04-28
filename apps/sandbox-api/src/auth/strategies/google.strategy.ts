import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';
import type { OAuthUser } from '../interfaces/oauth-user.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
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
      provider: 'google',
      providerAccountId: profile.id,
      email,
      name: profile.displayName ?? null,
      avatarUrl,
      accessToken,
      refreshToken: refreshToken ?? null,
    };

    done(null, user);
  }
}
