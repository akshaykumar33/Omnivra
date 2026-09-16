export type EventSource = 'vision' | 'voice' | 'keyboard' | 'mouse' | 'plugin' | 'system';

export interface EventContextSnapshot {
  activeApp?: string;
  activeUrl?: string;
  activeLanguageId?: string;
  cursorLine?: number;
  timestamp: number;
}

export interface OmnivraEvent<TPayload = unknown> {
  id: string;
  type: string;
  source: EventSource;
  timestamp: number;
  confidence: number;
  context: EventContextSnapshot;
  payload: TPayload;
  metadata?: Record<string, unknown>;
}

export type EventHandler<T = unknown> = (event: OmnivraEvent<T>) => void | Promise<void>;
export type UnsubscribeFn = () => void;
