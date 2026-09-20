# Specification: VS Code Adapter Specification

## 1. Problem Statement

Developers need hands-free split navigation and refactoring command triggers.

## 2. Goals & Non-Goals

- **Goals**: Bridge editor commands, selection manipulation, and terminal toggling.
- **Non-Goals**: Does not implement premature application logic or bypass permission safeguards.

## 3. User Experience

- Transparent, low-latency execution (< 120ms).
- Visual feedback via ambient HUD indicator.

## 4. Technical Architecture & API Contracts

```typescript
export interface VSCodeAdapter extends HostAdapter {
  executeEditorCommand(cmd: string, args?: unknown[]): Promise<void>;
}
```

## 5. Security & Privacy

- Local-first execution boundary.
- Capability grants checked prior to execution.

## 6. Performance Budgets

- Maximum execution latency: ≤ 15ms.
- Zero memory leaks across 24h continuous operation.

## 7. Acceptance Criteria

- 100% unit test coverage of public interfaces.
- Validated against schema specification.
