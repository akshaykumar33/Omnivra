# ADR 0006: State Management

## Status
Accepted

## Context
The UI and extension popup require rapid reactive state updates without unnecessary re-renders or state desynchronization.

## Decision
Adopt Zustand for client UI state and TanStack Query for asynchronous configuration, models, and sync data.

## Alternatives Considered
Redux Toolkit (verbose boilerplate), Jotai/Recoil (excessive atom granularity).

## Consequences
Clean modular stores, zero-boilerplate hooks, seamless state persistence.

## Security Impact
Enforces security boundaries, validates input integrity, and eliminates untrusted code execution paths.

## Performance Impact
Substantially reduces memory footprint and latency overhead across all target surfaces.

## Revisit Conditions
Revisit if underlying engine ecosystem or browser platform standards substantially change.
