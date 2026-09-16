# Event Architecture & Envelope Specification

Every multimodal input, system state change, and rule execution is represented as an immutable, typed `OmnivraEvent`.

## Standard Event Envelope Schema

```typescript
export interface OmnivraEvent<TPayload = unknown> {
  id: string;                    // UUID v4
  type: string;                  // e.g. 'gesture:hand.pinch', 'voice:command.matched'
  source: EventSource;           // 'vision' | 'voice' | 'keyboard' | 'plugin' | 'system'
  timestamp: number;             // Epoch milliseconds
  confidence: number;            // 0.0 to 1.0
  context: EventContextSnapshot; // Active window, URL, editor selection
  payload: TPayload;
  metadata?: Record<string, unknown>;
}
```

## Event Flow & Throttling
1. **Debouncing & Deduplication**: High-frequency signals (such as continuous gaze tracking or repeated gestures) pass through sliding-window deduplicators.
2. **Priority Queues**:
   * Priority 0 (Emergency/Stop): Emergency cease actions, security overrides.
   * Priority 1 (Interactive Controls): Voice commands, discrete gestures, shortcuts.
   * Priority 2 (Continuous): Eye coordinates, cursor tracking.
   * Priority 3 (Background/Telemetry): System health, latency metrics.
