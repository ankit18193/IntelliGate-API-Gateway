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
  MongoMetricsStore: () => MongoMetricsStore
});
module.exports = __toCommonJS(index_exports);

// src/MongoMetricsStore.ts
var MongoMetricsStore = class {
  constructor(model) {
    this.model = model;
  }
  model;
  async save(metrics) {
    if (metrics.length === 0) return;
    const docs = metrics.map((m) => ({
      endpoint: m.endpoint,
      method: "GET",
      // Defaulting as original schema requires it but new model doesn't track it
      status: m.status,
      latency: m.latency,
      timestamp: new Date(m.timestamp).toISOString()
    }));
    await this.model.insertMany(docs);
  }
  async getRecent(endpoint, limit) {
    const data = await this.model.find({ endpoint }).sort({ timestamp: -1 }).limit(limit).lean();
    return data.map((d) => ({
      endpoint: d.endpoint,
      latency: d.latency,
      status: d.status,
      timestamp: new Date(d.timestamp).getTime() || Date.now()
    }));
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MongoMetricsStore
});
