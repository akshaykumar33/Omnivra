# Specification: AI Provider Gateway Specification

## 1. Problem Statement

Vendor lock-in to OpenAI limits privacy and local offline operation.

## 2. Goals & Non-Goals

- **Goals**: Abstract Ollama, Gemini, Claude, and OpenAI behind strict Zod-validated rule synthesis.
- **Non-Goals**: Does not implement premature application logic or bypass permission safeguards.

## 3. User Experience

- Transparent, low-latency execution (< 120ms).
- Visual feedback via ambient HUD indicator.

## 4. Technical Architecture & API Contracts

```typescript
export interface AIGateway {
  synthesizeRule(prompt: string): Promise<RuleDraft>;
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
