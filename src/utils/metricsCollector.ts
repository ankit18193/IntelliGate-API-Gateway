export interface RequestMetrics {
  endpoint: string;
  method: string;
  status: number;
  latency: number;
  timestamp: string;
}

export const collectMetrics = (
  request: Request,
  response: Response,
  startTime: number
): RequestMetrics => {
  const url = new URL(request.url);

  const latency = Date.now() - startTime;

  return {
    endpoint: url.pathname,
    method: request.method,
    status: response.status,
    latency,
    timestamp: new Date().toISOString(),
  };
};