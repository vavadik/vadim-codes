import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}
