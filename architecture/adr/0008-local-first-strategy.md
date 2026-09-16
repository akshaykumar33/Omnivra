# ADR 0008: Local-First Strategy

## Status
Accepted

## Context
Streaming raw webcam video or microphone audio to cloud servers creates massive privacy vulnerabilities and unacceptable latency.

## Decision
All vision (MediaPipe/ONNX) and primary speech models execute strictly on the local machine.

## Alternatives Considered
Cloud video streaming APIs (unacceptable latency > 500ms, massive bandwidth costs, severe privacy risks).

## Consequences
Instant response (< 50ms inference), full offline usability, unassailable privacy.

## Security Impact
Enforces security boundaries, validates input integrity, and eliminates untrusted code execution paths.

## Performance Impact
Substantially reduces memory footprint and latency overhead across all target surfaces.

## Revisit Conditions
Revisit if underlying engine ecosystem or browser platform standards substantially change.
