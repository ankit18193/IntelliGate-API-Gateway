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
export {
  MongoMetricsStore
};
