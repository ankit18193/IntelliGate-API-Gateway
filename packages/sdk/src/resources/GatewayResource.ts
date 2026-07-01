import { APIResource } from './APIResource';
import { ApiResponse, User, RequestOptions } from '../types';

export class GatewayResource extends APIResource {
  /**
   * Access the public gateway proxy endpoint.
   */
  public async public(options?: RequestOptions): Promise<ApiResponse<{ message: string }>> {
    return this.get<ApiResponse<{ message: string }>>('/gateway/public', options);
  }

  /**
   * Access the private gateway proxy endpoint.
   * Requires a valid API Key.
   */
  public async private(options?: RequestOptions): Promise<ApiResponse<{ message: string; user: User }>> {
    return this.get<ApiResponse<{ message: string; user: User }>>('/gateway/private', options);
  }
}
