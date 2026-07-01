import { APIResource } from './APIResource';
import { ApiResponse, Metrics, RequestOptions } from '../types';

export class MetricsResource extends APIResource {
  /**
   * Retrieve collected metrics.
   */
  public async list(options?: RequestOptions): Promise<ApiResponse<Metrics[]>> {
    return this.get<ApiResponse<Metrics[]>>('/metrics', options);
  }
}
