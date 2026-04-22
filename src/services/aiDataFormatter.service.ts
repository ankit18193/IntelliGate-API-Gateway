
export interface AIInput {
  endpoint: string;
  avgLatency: number;
  errorRate: number;
  requests: number;
  cacheHitRate: number;
}


export interface RawMetrics {
  endpoint: string;
  avgLatency?: number | string;
  errorRate?: string | number; 
  totalRequests?: number | string;
}


const toNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};


const parseErrorRate = (value: unknown): number => {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const cleaned = value.replace("%", "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  return 0;
};


export const formatMetricsForAI = (metrics: RawMetrics): AIInput => {
  return {
    endpoint: metrics.endpoint,

    avgLatency: toNumber(metrics.avgLatency),

    errorRate: parseErrorRate(metrics.errorRate),

    requests: toNumber(metrics.totalRequests),

    
    cacheHitRate: 0,
  };
};