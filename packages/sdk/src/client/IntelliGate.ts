import { ClientOptions } from '../types';
import { ConfigResolver } from '../config';
import { Auth } from '../auth';
import { Transport } from '../transport';

import { GatewayResource } from '../resources/GatewayResource';
import { MetricsResource } from '../resources/MetricsResource';
import { DecisionResource } from '../resources/DecisionResource';
import { OptimizeResource } from '../resources/OptimizeResource';
import { AuthResource } from '../resources/AuthResource';

export class IntelliGate {
  public readonly gateway: GatewayResource;
  public readonly metrics: MetricsResource;
  public readonly decisions: DecisionResource;
  public readonly optimize: OptimizeResource;
  public readonly auth: AuthResource;

  private transport: Transport;

  constructor(options?: ClientOptions) {
    const config = ConfigResolver.resolve(options);
    const auth = new Auth(config.apiKey);
    
    this.transport = new Transport(config.baseURL, auth, config.timeout, config.maxRetries);

    this.gateway = new GatewayResource(this.transport);
    this.metrics = new MetricsResource(this.transport);
    this.decisions = new DecisionResource(this.transport);
    this.optimize = new OptimizeResource(this.transport);
    this.auth = new AuthResource(this.transport);
  }
}
