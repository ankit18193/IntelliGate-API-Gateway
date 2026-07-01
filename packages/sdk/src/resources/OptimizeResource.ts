import { APIResource } from './APIResource';
import { ApiResponse, Decision, RequestOptions } from '../types';

export interface OptimizeRunPayload {
  endpoint: string;
  issue: string;
}

export class OptimizeResource extends APIResource {
  /**
   * Manually trigger the optimization engine.
   */
  public async run(payload: OptimizeRunPayload, options?: RequestOptions): Promise<ApiResponse<{ decision: Decision }>> {
    return this.post<ApiResponse<{ decision: Decision }>>('/optimize/run', payload, options);
  }
}
