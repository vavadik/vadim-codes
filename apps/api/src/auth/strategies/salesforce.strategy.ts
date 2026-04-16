import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import type { SfUser } from '../interfaces/sf-user.interface';

@Injectable()
export class SalesforceStrategy extends PassportStrategy(Strategy, 'salesforce') {
  private readonly instanceUrl: string;

  constructor(config: ConfigService) {
    const instanceUrl = config.getOrThrow<string>('SF_INSTANCE_URL');
    super({
      authorizationURL: `${instanceUrl}/services/oauth2/authorize`,
      tokenURL: `${instanceUrl}/services/oauth2/token`,
      clientID: config.getOrThrow<string>('SF_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('SF_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('SF_CALLBACK_URL'),
      scope: ['openid', 'profile', 'email', 'api'],
    });
    this.instanceUrl = instanceUrl;
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    _profile: unknown,
    done: (err: Error | null, user?: SfUser) => void
  ): Promise<void> {
    const response = await fetch(`${this.instanceUrl}/services/oauth2/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      done(new Error('Failed to fetch Salesforce user info'));
      return;
    }

    const userinfo = (await response.json()) as {
      user_id: string;
      organization_id: string;
      email: string;
      urls: Record<string, string>;
    };

    // Derive the org's instance URL from the urls map (e.g. "https://na1.salesforce.com")
    const sfInstanceUrl = new URL(userinfo.urls['rest'] ?? userinfo.urls['enterprise']).origin;

    done(null, {
      sfUserId: userinfo.user_id,
      sfOrgId: userinfo.organization_id,
      email: userinfo.email,
      sfAccessToken: accessToken,
      sfInstanceUrl,
    });
  }
}
