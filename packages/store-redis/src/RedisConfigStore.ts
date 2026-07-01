import { IConfigStore, Configuration } from '@intelligate/shared';

export class RedisConfigStore implements IConfigStore {
  constructor(
    private readonly getConfigFn: (endpoint: string) => Promise<any>,
    private readonly updateConfigFn: (endpoint: string, updates: any) => Promise<any>
  ) {}

  async getConfig(endpoint: string): Promise<Configuration> {
    const config = await this.getConfigFn(endpoint);
    return {
      cacheEnabled: config.cache || false,
      cacheTtl: config.ttl || 30,
      rateLimit: config.rateLimit || 50,
      isFlagged: config.flagged || false,
    };
  }

  async updateConfig(endpoint: string, updates: Partial<Configuration>): Promise<void> {
    const mappedUpdates: any = {};
    if (updates.cacheEnabled !== undefined) mappedUpdates.cache = updates.cacheEnabled;
    if (updates.cacheTtl !== undefined) mappedUpdates.ttl = updates.cacheTtl;
    if (updates.rateLimit !== undefined) mappedUpdates.rateLimit = updates.rateLimit;
    if (updates.isFlagged !== undefined) mappedUpdates.flagged = updates.isFlagged;
    
    await this.updateConfigFn(endpoint, mappedUpdates);
  }
}
