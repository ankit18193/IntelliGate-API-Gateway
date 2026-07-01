import { SDKError } from '../errors';

export class Auth {
  constructor(private readonly apiKey?: string) {}

  public getHeaders(): Record<string, string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      return {};
    }
    return {
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }
}
