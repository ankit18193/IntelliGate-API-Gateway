import { Analysis, IProvider, Suggestion } from '@intelligate/shared';
import { FallbackManager } from './FallbackManager';

export class ProviderRouter {
  constructor(
    private readonly providers: IProvider[],
    private readonly fallbackManager: FallbackManager
  ) {}

  public async getSuggestions(analysis: Analysis): Promise<Suggestion[]> {
    return this.fallbackManager.executeWithFallback(analysis, this.providers);
  }
}
