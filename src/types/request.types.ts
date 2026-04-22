export interface RequestContext {
  requestId: string;
  startTime: number;
  user?: {
    id: string;
    email?: string;
  };
}

export interface GatewayRequest {
  request: Request;
  context: RequestContext;
}