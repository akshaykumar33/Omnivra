# Claude Code Configuration

Canonical instructions located at [AGENTS.md](AGENTS.md).

Build: `pnpm turbo run build`
Test: `pnpm turbo run test`
Typecheck: `pnpm turbo run typecheck`

<!-- CODEGRAPH_START -->

## CodeGraph & Graphify Architecture Sync

This repository is indexed by CodeGraph (.codegraph/).
To minimize token consumption, prevent hallucinations, and preserve context:

- **ALWAYS reach for CodeGraph FIRST** before using grep, glob, or reading raw source files.
- Use the MCP tool codegraph_explore or run codegraph explore "<symbol or question>" to understand code, relationships, and call paths in one call.
- Use codegraph node <symbol> to view exact symbol implementations and caller/callee trails.
- Never dump or read full large files into context unless actively modifying them.

<!-- CODEGRAPH_END -->
