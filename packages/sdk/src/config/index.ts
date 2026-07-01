import { ClientOptions } from '../types';

export const DEFAULT_CONFIG = {
  baseURL: 'https://api.intelligate.dev/v1',
  timeout: 10000,
  maxRetries: 2,
};

export class ConfigResolver {
  public static resolve(options?: ClientOptions): Required<ClientOptions> {
    const envApiKey = typeof process !== 'undefined' ? process.env?.INTELLIGATE_API_KEY : undefined;
    const envBaseURL = typeof process !== 'undefined' ? process.env?.INTELLIGATE_BASE_URL : undefined;

    return {
      apiKey: options?.apiKey || envApiKey || '',
      baseURL: options?.baseURL || envBaseURL || DEFAULT_CONFIG.baseURL,
      timeout: options?.timeout ?? DEFAULT_CONFIG.timeout,
      maxRetries: options?.maxRetries ?? DEFAULT_CONFIG.maxRetries,
    };
  }
}
