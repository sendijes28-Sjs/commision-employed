import { Request } from 'express';

export interface JwtUser {
  id: number;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  team: string;
  name?: string;
}

/**
 * Express Request with authenticated JWT user attached by auth middleware.
 */
export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}
