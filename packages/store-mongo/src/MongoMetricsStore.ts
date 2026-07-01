import { IMetricsStore, Metrics } from '@intelligate/shared';

export class MongoMetricsStore implements IMetricsStore {
  constructor(private readonly model: any) {}

  async save(metrics: Metrics[]): Promise<void> {
    if (metrics.length === 0) return;
    
    // Map to Mongoose schema
    const docs = metrics.map(m => ({
      endpoint: m.endpoint,
      method: 'GET', // Defaulting as original schema requires it but new model doesn't track it
      status: m.status,
      latency: m.latency,
      timestamp: new Date(m.timestamp).toISOString(),
    }));
    
    await this.model.insertMany(docs);
  }

  async getRecent(endpoint: string, limit: number): Promise<Metrics[]> {
    const data = await this.model
      .find({ endpoint })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return data.map((d: any) => ({
      endpoint: d.endpoint,
      latency: d.latency,
      status: d.status,
      timestamp: new Date(d.timestamp).getTime() || Date.now()
    }));
  }
}
