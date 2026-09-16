import type { ActionDescriptor, ActionResult, HostAdapter } from '@omnivra/types';
import { logger } from '@omnivra/logger';

export class ActionDispatcher {
  private adapters: Map<string, HostAdapter> = new Map();

  registerAdapter(adapter: HostAdapter): void {
    this.adapters.set(adapter.id, adapter);
    logger.info(`Registered adapter: ${adapter.name} (${adapter.id})`);
  }

  async dispatch(action: ActionDescriptor): Promise<ActionResult> {
    for (const adapter of this.adapters.values()) {
      if (adapter.supports(action.type)) {
        return await adapter.execute(action);
      }
    }

    logger.warn(`No adapter found for action type: ${action.type}`);
    return {
      success: false,
      actionId: action.id,
      error: `No supporting adapter registered for action type: ${action.type}`
    };
  }
}
