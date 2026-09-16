import { TypedEventBus } from '@omnivra/event-bus';
import { RuleEvaluator } from '@omnivra/rule-engine';
import { ActionDispatcher } from '@omnivra/action-engine';
import type { HostAdapter, OmnivraEvent } from '@omnivra/types';
import { logger } from '@omnivra/logger';

export class OmnivraKernel {
  readonly eventBus: TypedEventBus;
  readonly ruleEvaluator: RuleEvaluator;
  readonly actionDispatcher: ActionDispatcher;
  private initialized = false;

  constructor() {
    this.eventBus = new TypedEventBus();
    this.ruleEvaluator = new RuleEvaluator();
    this.actionDispatcher = new ActionDispatcher();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.eventBus.subscribe('*', (event: OmnivraEvent) => {
      const actions = this.ruleEvaluator.evaluate(event);
      for (const action of actions) {
        void this.actionDispatcher.dispatch(action);
      }
    });

    this.initialized = true;
    logger.info('Omnivra Kernel initialized successfully.');
  }

  registerAdapter(adapter: HostAdapter): void {
    this.actionDispatcher.registerAdapter(adapter);
  }
}
