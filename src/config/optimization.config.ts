import { redis } from "@/lib/redis";

 

export type EndpointConfig = {
  cache: boolean;
  ttl: number;
  rateLimit: number;
  flagged: boolean;
  lastUpdated: string;  
};

 

const createDefaultConfig = (): EndpointConfig => ({
  cache: false,
  ttl: 30,
  rateLimit: 50,
  flagged: false,
  lastUpdated: new Date().toISOString(),
});

 

const PREFIX = "optimization";

const getKey = (endpoint: string): string => {
  return `${PREFIX}:${endpoint}`;
};

 
export const getConfig = async (
  endpoint: string
): Promise<EndpointConfig> => {
  if (!redis) return createDefaultConfig();

  try {
    const data = await redis.get(getKey(endpoint));

    if (!data) return createDefaultConfig();

    const parsed = JSON.parse(data) as Partial<EndpointConfig>;

    return {
      cache: parsed.cache ?? false,
      ttl: parsed.ttl ?? 30,
      rateLimit: parsed.rateLimit ?? 50,
      flagged: parsed.flagged ?? false,
      lastUpdated: parsed.lastUpdated ?? new Date().toISOString(),
    };
  } catch {
    return createDefaultConfig();
  }
};

 
export const updateConfig = async (
  endpoint: string,
  updates: Partial<EndpointConfig>
): Promise<EndpointConfig> => {
  const current = await getConfig(endpoint);

  const updated: EndpointConfig = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };

  if (redis) {
    await redis.set(getKey(endpoint), JSON.stringify(updated));
  }

  return updated;
};

 
export const resetConfig = async (endpoint: string): Promise<void> => {
  if (!redis) return;

  await redis.set(getKey(endpoint), JSON.stringify(createDefaultConfig()));
};

 
export const getAllConfigs = async (): Promise<
  Array<{ endpoint: string } & EndpointConfig>
> => {
  if (!redis) return [];

  const keys = await redis.keys(`${PREFIX}:*`);

  const results: Array<{ endpoint: string } & EndpointConfig> = [];

  for (const key of keys) {
    try {
      const data = await redis.get(key);
      if (!data) continue;

      const parsed = JSON.parse(data) as Partial<EndpointConfig>;

      results.push({
        endpoint: key.replace(`${PREFIX}:`, ""),
        cache: parsed.cache ?? false,
        ttl: parsed.ttl ?? 30,
        rateLimit: parsed.rateLimit ?? 50,
        flagged: parsed.flagged ?? false,
        lastUpdated:
          parsed.lastUpdated ?? new Date().toISOString(),
      });
    } catch {
      continue;
    }
  }

  return results;
};

 
export const deleteConfig = async (endpoint: string): Promise<void> => {
  if (!redis) return;

  await redis.del(getKey(endpoint));
};



 
export const isCacheEnabled = async (endpoint: string): Promise<boolean> => {
  const config = await getConfig(endpoint);
  return config.cache;
};

 
export const getTTL = async (endpoint: string): Promise<number> => {
  const config = await getConfig(endpoint);
  return config.ttl;
};

 
export const getRateLimit = async (endpoint: string): Promise<number> => {
  const config = await getConfig(endpoint);
  return config.rateLimit;
};

 
export const isFlagged = async (endpoint: string): Promise<boolean> => {
  const config = await getConfig(endpoint);
  return config.flagged;
};