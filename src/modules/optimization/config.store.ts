import { redis } from "@/lib/redis";
import { OptimizationConfig } from "@/types/optimizationConfig.types";

const PREFIX = "optimization";


const createDefaultConfig = (): OptimizationConfig => ({
  cache: false,
  ttl: 30,
  rateLimit: 50,
  flagged: false,
  lastUpdated: new Date(),
});


const getKey = (endpoint: string): string => {
  return `${PREFIX}:${endpoint}`;
};

// 🔥 GET CONFIG
export const getConfig = async (
  endpoint: string
): Promise<OptimizationConfig> => {
  if (!redis) return createDefaultConfig();

  try {
    const data = await redis.get(getKey(endpoint));

    if (!data) return createDefaultConfig();

    const parsed = JSON.parse(data) as {
      cache: boolean;
      ttl: number;
      rateLimit: number;
      flagged: boolean;
      lastUpdated: string;
    };

    return {
      ...parsed,
      lastUpdated: new Date(parsed.lastUpdated),
    };
  } catch {
    return createDefaultConfig();
  }
};


export const setConfig = async (
  endpoint: string,
  config: OptimizationConfig
): Promise<void> => {
  if (!redis) return;

  const toStore = {
    ...config,
    lastUpdated: config.lastUpdated.toISOString(), 
  };

  await redis.set(getKey(endpoint), JSON.stringify(toStore));
};


export const updateConfig = async (
  endpoint: string,
  updates: Partial<OptimizationConfig>
): Promise<void> => {
  const current = await getConfig(endpoint);

  const updated: OptimizationConfig = {
    ...current,
    ...updates,
    lastUpdated: new Date(),
  };

  await setConfig(endpoint, updated);
};