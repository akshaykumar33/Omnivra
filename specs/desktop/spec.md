# Specification: Desktop Host Adapter Specification

## 1. Problem Statement
Browser extensions cannot access global OS windows, native hotkeys, or system volume.

## 2. Goals & Non-Goals
* **Goals**: Implement Tauri v2 companion with secure JSON-RPC native messaging bridge.
* **Non-Goals**: Does not implement premature application logic or bypass permission safeguards.

## 3. User Experience
* Transparent, low-latency execution (< 120ms).
* Visual feedback via ambient HUD indicator.

## 4. Technical Architecture & API Contracts
```typescript
export interface DesktopAdapter extends HostAdapter {
  switchApplication(appName: string): Promise<void>;
  sendNativeKeystroke(keys: string[]): Promise<void>;
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
