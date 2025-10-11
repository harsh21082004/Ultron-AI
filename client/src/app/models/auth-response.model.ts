import { User } from './user.model';

/**
 * Defines the expected shape of the response from your backend's
 * login or registration endpoints.
 */
export interface AuthResponse {
  user: User;
  token: string; // A JWT or similar session token
}
