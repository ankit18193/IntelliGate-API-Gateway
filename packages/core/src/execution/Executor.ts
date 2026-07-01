import { Decision, Action, IConfigStore, ILogger, IEventEmitter } from '@intelligate/shared';

export class Executor {
  private decisionMemory: Record<string, number> = {};
  private failureCount = 0;
  private readonly MAX_FAILURES = 3;
  private readonly COOLDOWN = 60 * 1000;

  constructor(
    private readonly configStore: IConfigStore,
    private readonly logger: ILogger,
    private readonly eventEmitter: IEventEmitter
  ) {}

  public async executeDecision(decision: Decision): Promise<Action> {
    const { action, target, metadata, reason } = decision;

    if (this.failureCount >= this.MAX_FAILURES) {
      this.logger.error(`Circuit breaker triggered! Halting AI optimizations for ${target}`);
      return { decision, status: 'BLOCKED_CIRCUIT', timestamp: Date.now() };
    }

    const key = `${target}:${action}`;
    const now = Date.now();

    if (this.decisionMemory[key] && now - this.decisionMemory[key] < this.COOLDOWN) {
      this.logger.info(`Skipped ${action} (cooldown active) for ${target}`);
      return { decision, status: 'SKIPPED_COOLDOWN', timestamp: now };
    }

    try {
      const currentConfig = await this.configStore.getConfig(target);

      if (action === 'ENABLE_CACHE') {
        const ttl = metadata?.ttl ?? 60;
        await this.configStore.updateConfig(target, { cacheEnabled: true, cacheTtl: ttl });
      } else if (action === 'INCREASE_RATE_LIMIT') {
        const increment = metadata?.increment ?? 20;
        await this.configStore.updateConfig(target, { rateLimit: currentConfig.rateLimit + increment });
      } else if (action === 'FLAG_ENDPOINT') {
        await this.configStore.updateConfig(target, { isFlagged: true });
      }

      this.decisionMemory[key] = now;
      this.logger.info(`Executed ${action} on ${target}. Reason: ${reason}`);
      this.eventEmitter.emit('action_executed', { action, target, metadata, reason });

      return { decision, status: 'EXECUTED', timestamp: now };
    } catch (error) {
      this.failureCount++;
      this.logger.error(`Failed to execute decision ${action} on ${target}`, error);
      throw error;
    }
  }
}
