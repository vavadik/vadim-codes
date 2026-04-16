import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

declare global {
  namespace Express {
    // Passport types req.user as Express.User — extend it with JwtPayload fields
    interface User extends JwtPayload {}
  }
}
