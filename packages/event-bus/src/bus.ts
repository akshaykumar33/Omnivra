import type { OmnivraEvent, EventHandler, UnsubscribeFn } from '@omnivra/types';
import { logger } from '@omnivra/logger';

export class TypedEventBus {
  private subscribers: Map<string, Set<EventHandler>> = new Map();

  publish(event: OmnivraEvent): void {
    logger.debug(`EventBus publish: ${event.type}`, { id: event.id, source: event.source });
    const handlers = this.subscribers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          void handler(event);
        } catch (err) {
          logger.error(`Handler failed for event ${event.type}:`, err);
        }
      }
    }
    const wildcardHandlers = this.subscribers.get('*');
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        try {
          void handler(event);
        } catch (err) {
          logger.error('Wildcard handler failed:', err);
        }
      }
    }
  }

  subscribe<T = unknown>(eventType: string, handler: EventHandler<T>): UnsubscribeFn {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    const set = this.subscribers.get(eventType)!;
    set.add(handler as EventHandler);

    return () => {
      set.delete(handler as EventHandler);
      if (set.size === 0) {
        this.subscribers.delete(eventType);
      }
    };
  }
}
