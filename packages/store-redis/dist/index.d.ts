import { IConfigStore, Configuration } from '@intelligate/shared';

declare class RedisConfigStore implements IConfigStore {
    private readonly getConfigFn;
    private readonly updateConfigFn;
    constructor(getConfigFn: (endpoint: string) => Promise<any>, updateConfigFn: (endpoint: string, updates: any) => Promise<any>);
    getConfig(endpoint: string): Promise<Configuration>;
    updateConfig(endpoint: string, updates: Partial<Configuration>): Promise<void>;
}

export { RedisConfigStore };
