# ADR 0007: AI Provider Abstraction

## Status

Accepted

## Context

AI is used for natural language intent resolution and rule generation. Users prefer local models (Ollama) or private cloud models.

## Decision

Design a unified AI provider interface supporting local Ollama, Gemini, Claude, and OpenAI with Zod schema validation.

## Alternatives Considered

Hardcoding OpenAI SDK (vendor lock-in, privacy concerns for enterprise users).

## Consequences

Complete provider independence, offline-capable local inference, cost optimization.

## Security Impact

Enforces security boundaries, validates input integrity, and eliminates untrusted code execution paths.

## Performance Impact

Substantially reduces memory footprint and latency overhead across all target surfaces.

## Revisit Conditions

Revisit if underlying engine ecosystem or browser platform standards substantially change.
