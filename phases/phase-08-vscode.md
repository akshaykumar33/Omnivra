# Phase 08: VS Code Extension Host

## 1. Objective

Scaffold VS Code extension, editor context provider, and command bridge.

## 2. Why Now

Fundamental dependency for downstream components in the Omnivra pipeline.

## 3. Scope & Non-Scope

- **In Scope**: Full architecture compliance, comprehensive automated tests, and documentation.
- **Out of Scope**: Unrelated experimental features or premature application code.

## 4. Architectural Boundaries

- Respects unidirectional dependencies and local-first execution.
- Requires capability grants for all dispatched actions.

## 5. Exit Criteria

- 100% test coverage for phase deliverables.
- All PRs pass lint, typecheck, and CI checks.
- Documentation and ADRs updated.
