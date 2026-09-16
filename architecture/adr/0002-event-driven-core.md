# ADR 0002: Event-Driven Core

## Status
Accepted

## Context
Inputs arrive from disparate modalities with varying sampling frequencies (30fps vision, audio streams, discrete keypresses).

## Decision
Build a centralized, typed event bus routing normalized OmnivraEvent envelopes with priority levels and rate-limiting.

## Alternatives Considered
Direct function calls (couples inputs to hosts), RxJS everywhere (heavy bundle for browser extension).

## Consequences
Decoupled architecture, testable in isolation, clear replay and debugging facilities.

## Security Impact
Enforces security boundaries, validates input integrity, and eliminates untrusted code execution paths.

## Performance Impact
Substantially reduces memory footprint and latency overhead across all target surfaces.

## Revisit Conditions
Revisit if underlying engine ecosystem or browser platform standards substantially change.
