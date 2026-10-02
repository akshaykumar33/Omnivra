# ADR 0009: Security Model

## Status

Accepted

## Context

Giving multimodal inputs control over OS and browser actions presents a large attack surface if abused.

## Decision

Enforce capability-based permission security with mandatory interactive confirmations for destructive or sensitive commands.

## Alternatives Considered

Blanket OS access (unacceptable vulnerability), prompt-on-every-action (ruins user experience).

## Consequences

Transparent permission audit trail, sandboxed plugins, high user trust.

## Security Impact

Enforces security boundaries, validates input integrity, and eliminates untrusted code execution paths.

## Performance Impact

Substantially reduces memory footprint and latency overhead across all target surfaces.

## Revisit Conditions

Revisit if underlying engine ecosystem or browser platform standards substantially change.
