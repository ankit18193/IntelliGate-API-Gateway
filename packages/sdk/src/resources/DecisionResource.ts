import { APIResource } from './APIResource';
import { ApiResponse, Decision, RequestOptions } from '../types';

export class DecisionResource extends APIResource {
  /**
   * Retrieve automation decisions made by the gateway.
   */
  public async list(options?: RequestOptions): Promise<ApiResponse<Decision[]>> {
    return this.get<ApiResponse<Decision[]>>('/decisions', options);
  }
}
