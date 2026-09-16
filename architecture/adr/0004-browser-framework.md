# ADR 0004: Browser Framework

## Status
Accepted

## Context
Manifest V3 introduces strict service worker lifetimes, dynamic script injection restrictions, and cross-browser packaging friction.

## Decision
Use WXT (Next-gen Web Extension Framework) targeting Chrome, Edge, and Firefox simultaneously with Vite support.

## Alternatives Considered
Plasmo (inflexible Vite integration), raw Webpack configs (high maintenance burden).

## Consequences
HMR in extension development, automatic manifest generation, unified polyfills.

## Security Impact
Enforces security boundaries, validates input integrity, and eliminates untrusted code execution paths.

## Performance Impact
Substantially reduces memory footprint and latency overhead across all target surfaces.

## Revisit Conditions
Revisit if underlying engine ecosystem or browser platform standards substantially change.
