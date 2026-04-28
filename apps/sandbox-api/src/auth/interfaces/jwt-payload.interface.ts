export interface JwtPayload {
  sub: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}
