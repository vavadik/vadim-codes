export interface JwtPayload {
  sub: string; // sfUserId
  org: string; // sfOrgId
  email: string;
}
