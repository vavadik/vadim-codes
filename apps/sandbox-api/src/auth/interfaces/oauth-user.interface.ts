export interface OAuthUser {
  provider: 'google' | 'github';
  providerAccountId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  accessToken: string;
  refreshToken: string | null;
}
