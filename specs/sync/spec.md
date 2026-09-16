# Specification: Sync & CRDT Specification

## 1. Problem Statement
Offline rule edits on laptop and desktop must merge without overwriting each other.

## 2. Goals & Non-Goals
* **Goals**: Implement Yjs / Automerge CRDT document synchronization with AES-GCM encryption.
* **Non-Goals**: Does not implement premature application logic or bypass permission safeguards.

## 3. User Experience
* Transparent, low-latency execution (< 120ms).
* Visual feedback via ambient HUD indicator.

## 4. Technical Architecture & API Contracts
```typescript
export interface SyncEngine {
  mergeRemote(update: Uint8Array): void;
  exportLocalState(): Uint8Array;
}
```

## 5. Security & Privacy
* Local-first execution boundary.
* Capability grants checked prior to execution.

## 6. Performance Budgets
* Maximum execution latency: ≤ 15ms.
* Zero memory leaks across 24h continuous operation.

## 7. Acceptance Criteria
* 100% unit test coverage of public interfaces.
* Validated against schema specification.
