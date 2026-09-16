# Specification: Core Kernel Specification

## 1. Problem Statement
Multiple host environments need a unified orchestrator without duplicating business logic.

## 2. Goals & Non-Goals
* **Goals**: Provide single initialization point, manage adapter registry, coordinate subsystem lifecycles.
* **Non-Goals**: Does not implement premature application logic or bypass permission safeguards.

## 3. User Experience
* Transparent, low-latency execution (< 120ms).
* Visual feedback via ambient HUD indicator.

## 4. Technical Architecture & API Contracts
```typescript
export interface OmnivraKernel {
  initialize(): Promise<void>;
  registerAdapter(adapter: HostAdapter): void;
  shutdown(): Promise<void>;
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
