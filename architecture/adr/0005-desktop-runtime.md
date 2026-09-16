# ADR 0005: Desktop Runtime

## Status
Accepted

## Context
Desktop control requires OS-level hotkeys, native window inspection, and low-latency IPC with native messaging.

## Decision
Adopt Tauri v2 with Rust backend and web-standard frontend.

## Alternatives Considered
Electron (excessive RAM/binary overhead, poor battery performance).

## Consequences
Small binary footprint (< 25MB), minimal idle memory usage (< 40MB), Rust safety guarantees.

## Security Impact
Enforces security boundaries, validates input integrity, and eliminates untrusted code execution paths.

## Performance Impact
Substantially reduces memory footprint and latency overhead across all target surfaces.

## Revisit Conditions
Revisit if underlying engine ecosystem or browser platform standards substantially change.
