# ADR 0001: Monorepo Strategy

## Status

Accepted

## Context

Omnivra comprises shared types, recognition engines, host adapters, extensions, and desktop tools that must stay version-synchronized.

## Decision

Adopt pnpm workspaces paired with Turborepo for caching and task orchestration, using Changesets for semantic versioning.

## Alternatives Considered

Nx (too heavy), Lerna (dated), Git submodules (high synchronization overhead).

## Consequences

Fast incremental builds, strict boundary enforcement, minimal disk usage via hardlinks.

## Security Impact

Enforces security boundaries, validates input integrity, and eliminates untrusted code execution paths.

## Performance Impact

Substantially reduces memory footprint and latency overhead across all target surfaces.

## Revisit Conditions

Revisit if underlying engine ecosystem or browser platform standards substantially change.
