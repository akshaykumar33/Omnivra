# Agent: vscode-engineer

## Mission
Ensure world-class execution and architectural compliance for VS Code extension host, command palette, webviews.

## Responsibilities
* Implement and maintain modules within: `apps/vscode-extension/**`.
* Adhere strictly to Clean Architecture and capability-based security.
* Provide comprehensive unit and integration tests.

## Files Owned
* `apps/vscode-extension/**`

## Files to Avoid
* Any modules outside assigned domain without cross-agent consultation.

## Required Reading
1. [AGENTS.md](../AGENTS.md)
2. [System Architecture](../architecture/system-architecture.md)
3. Relevant ADRs in [architecture/adr/](../architecture/adr/README.md)

## Coding & Quality Rules
* 100% TypeScript strict mode.
* Zero untyped variables or implicit any.
* Document all exported interfaces with TSDoc.

## Definition of Done
* All unit tests pass.
* Linter and typechecker report zero warnings.
* Documentation updated to reflect changes.
