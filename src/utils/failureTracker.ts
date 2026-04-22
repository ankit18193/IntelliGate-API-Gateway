type FailureStats = {
  total: number;
  failures: number;
  lastFailureTime: number;
  lastRequestTime: number;
  blockedUntil?: number;
};

const failureMap: Record<string, FailureStats> = {};


const FAILURE_WINDOW = 60 * 1000;
const FAILURE_THRESHOLD = 0.6; 
const MIN_REQUESTS = 50;   
const BLOCK_DURATION = 30 * 1000; 


export const recordRequest = (endpoint: string) => {
  const now = Date.now();

  if (!failureMap[endpoint]) {
    failureMap[endpoint] = {
      total: 0,
      failures: 0,
      lastFailureTime: 0,
      lastRequestTime: now,
    };
  }

  const stats = failureMap[endpoint];

  
  if (now - stats.lastRequestTime > FAILURE_WINDOW) {
    stats.total = 0;
    stats.failures = 0;
  }

  stats.total++;
  stats.lastRequestTime = now;
};


export const recordFailureEvent = (endpoint: string) => {
  const stats = failureMap[endpoint];
  if (!stats) return;

  stats.failures++;
  stats.lastFailureTime = Date.now();
};


export const shouldBlockEndpoint = (endpoint: string): boolean => {
  
  if (process.env.NODE_ENV === "test") {
    return false;
  }

  const stats = failureMap[endpoint];
  if (!stats) return false;

  const now = Date.now();

  if (stats.blockedUntil && now < stats.blockedUntil) {
    return true;
  }

  if (stats.total < MIN_REQUESTS) return false;

  const failureRate = stats.failures / stats.total;

  if (failureRate >= FAILURE_THRESHOLD) {
    stats.blockedUntil = now + BLOCK_DURATION;

    stats.total = 0;
    stats.failures = 0;

    return true;
  }

  return false;
};


export const resetFailureTracker = () => {
  for (const key in failureMap) {
    delete failureMap[key];
  }
};