// src/RedisConfigStore.ts
var RedisConfigStore = class {
  constructor(getConfigFn, updateConfigFn) {
    this.getConfigFn = getConfigFn;
    this.updateConfigFn = updateConfigFn;
  }
  getConfigFn;
  updateConfigFn;
  async getConfig(endpoint) {
    const config = await this.getConfigFn(endpoint);
    return {
      cacheEnabled: config.cache || false,
      cacheTtl: config.ttl || 30,
      rateLimit: config.rateLimit || 50,
      isFlagged: config.flagged || false
    };
  }
  async updateConfig(endpoint, updates) {
    const mappedUpdates = {};
    if (updates.cacheEnabled !== void 0) mappedUpdates.cache = updates.cacheEnabled;
    if (updates.cacheTtl !== void 0) mappedUpdates.ttl = updates.cacheTtl;
    if (updates.rateLimit !== void 0) mappedUpdates.rateLimit = updates.rateLimit;
    if (updates.isFlagged !== void 0) mappedUpdates.flagged = updates.isFlagged;
    await this.updateConfigFn(endpoint, mappedUpdates);
  }
};
export {
  RedisConfigStore
};
