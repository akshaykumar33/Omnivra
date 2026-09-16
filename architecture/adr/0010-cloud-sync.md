# ADR 0010: Cloud Sync

## Status
Accepted

## Context
Users maintain multiple devices and want their custom rules, gestures, and hotkeys synchronized seamlessly.

## Decision
Implement client-side E2EE rule synchronization using Conflict-Free Replicated Data Types (CRDTs).

## Alternatives Considered
Plaintext server database sync (violates privacy commitment), manual export/import (poor UX).

## Consequences
Zero-knowledge server infrastructure, seamless offline-to-online reconciliation.

## Security Impact
Enforces security boundaries, validates input integrity, and eliminates untrusted code execution paths.

## Performance Impact
Substantially reduces memory footprint and latency overhead across all target surfaces.

## Revisit Conditions
Revisit if underlying engine ecosystem or browser platform standards substantially change.
