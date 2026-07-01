import { APIResource } from './APIResource';
import { ApiResponse, User, RequestOptions } from '../types';

export interface AuthPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthResource extends APIResource {
  /**
   * Register a new user and retrieve an API key (token).
   */
  public async register(payload: AuthPayload, options?: RequestOptions): Promise<ApiResponse<AuthResponse>> {
    return this.post<ApiResponse<AuthResponse>>('/auth/register', payload, options);
  }

  /**
   * Authenticate an existing user and retrieve their API key (token).
   */
  public async login(payload: AuthPayload, options?: RequestOptions): Promise<ApiResponse<AuthResponse>> {
    return this.post<ApiResponse<AuthResponse>>('/auth/login', payload, options);
  }
}
