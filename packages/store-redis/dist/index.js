"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  RedisConfigStore: () => RedisConfigStore
});
module.exports = __toCommonJS(index_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RedisConfigStore
});
