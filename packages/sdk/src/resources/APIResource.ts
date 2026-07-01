import { Transport } from '../transport';
import { RequestOptions } from '../types';

export abstract class APIResource {
  constructor(protected readonly transport: Transport) {}

  protected get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.transport.fetch<T>(path, { method: 'GET' }, options);
  }

  protected post<T>(path: string, body: any, options?: RequestOptions): Promise<T> {
    return this.transport.fetch<T>(path, { method: 'POST', body }, options);
  }
  
  protected put<T>(path: string, body: any, options?: RequestOptions): Promise<T> {
    return this.transport.fetch<T>(path, { method: 'PUT', body }, options);
  }
  
  protected delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.transport.fetch<T>(path, { method: 'DELETE' }, options);
  }
}
