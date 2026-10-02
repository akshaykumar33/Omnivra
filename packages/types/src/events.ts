export type EventSource =
  "vision" | "voice" | "keyboard" | "mouse" | "plugin" | "system";

export interface EventContextSnapshot {
  activeApp?: string;
  activeUrl?: string;
  activeLanguageId?: string;
  cursorLine?: number;
  timestamp: number;
}

export type EventContextField = keyof EventContextSnapshot;

/**
 * Every field of EventContextSnapshot, as a set that also exists at runtime.
 *
 * Deliberately typed `Record<EventContextField, true>`: adding a field to the
 * interface above without adding it here is a compile error, so this view can
 * never silently drift from the type.
 */
const EVENT_CONTEXT_FIELDS: Record<EventContextField, true> = {
  activeApp: true,
  activeUrl: true,
  activeLanguageId: true,
  cursorLine: true,
  timestamp: true,
};

/**
 * Narrows a rule condition field — which is authored by a user and so is just
 * a string — to a real context field.
 *
 * Without this, callers reach for `context as Record<string, unknown>`, which
 * TypeScript rejects outright (TS2352, no index signature) and which would
 * discard every guarantee the interface gives. An unrecognised field now reads
 * as undefined instead of silently indexing into nothing.
 */
export function isEventContextField(field: string): field is EventContextField {
  return Object.hasOwn(EVENT_CONTEXT_FIELDS, field);
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

export type EventHandler<T = unknown> = (
  event: OmnivraEvent<T>,
) => void | Promise<void>;
export type UnsubscribeFn = () => void;
