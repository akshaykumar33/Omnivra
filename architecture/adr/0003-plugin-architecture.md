# ADR 0003: Plugin Architecture

## Status
Accepted

## Context
Users must be able to install integrations for YouTube, Spotify, VS Code, Discord, and custom sites without touching core code.

## Decision
Establish a declarative plugin SDK (@omnivra/plugin-sdk) with explicit manifest permissions, triggers, and action definitions.

## Alternatives Considered
Monolithic built-ins (unscalable), arbitrary eval script injection (massive security hazard).

## Consequences
Safe sandbox execution, community ecosystem extensibility, granular capability audits.

## Security Impact
Enforces security boundaries, validates input integrity, and eliminates untrusted code execution paths.

## Performance Impact
Substantially reduces memory footprint and latency overhead across all target surfaces.

## Revisit Conditions
Revisit if underlying engine ecosystem or browser platform standards substantially change.
