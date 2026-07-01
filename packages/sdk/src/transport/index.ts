import { Auth } from '../auth';
import { TransportError, HTTPError } from '../errors';
import { RequestOptions } from '../types';
import { Serializer } from '../serializer';

export class Transport {
  constructor(
    private readonly baseURL: string,
    private readonly auth: Auth,
    private readonly defaultTimeout: number,
    private readonly defaultMaxRetries: number
  ) {}

  public async fetch<T>(path: string, options: { method: string; body?: any }, reqOpts?: RequestOptions): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const timeout = reqOpts?.timeout ?? this.defaultTimeout;
    const maxRetries = reqOpts?.maxRetries ?? this.defaultMaxRetries;

    const headers = {
      ...this.auth.getHeaders(),
      'Content-Type': 'application/json',
      ...reqOpts?.headers,
    };

    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: options.method,
          headers,
          body: options.body ? Serializer.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const text = await response.text();
        let data: any = text;
        if (text) {
          try {
            data = Serializer.parse(text);
          } catch {
            // keep as text
          }
        }

        if (!response.ok) {
          throw new HTTPError(response.status, response.statusText, data);
        }

        return data as T;
      } catch (error) {
        attempt++;
        if (error instanceof HTTPError && error.status < 500) {
          throw error; // Don't retry 4xx errors
        }
        if (attempt > maxRetries) {
          if (error instanceof HTTPError) throw error;
          throw new TransportError(`Failed to fetch ${url} after ${maxRetries} retries`, error);
        }
        // Exponential backoff
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
      }
    }
    
    throw new TransportError('Unreachable');
  }
}
