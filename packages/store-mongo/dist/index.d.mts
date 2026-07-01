import { IMetricsStore, Metrics } from '@intelligate/shared';

declare class MongoMetricsStore implements IMetricsStore {
    private readonly model;
    constructor(model: any);
    save(metrics: Metrics[]): Promise<void>;
    getRecent(endpoint: string, limit: number): Promise<Metrics[]>;
}

export { MongoMetricsStore };
