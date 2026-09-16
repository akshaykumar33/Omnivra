---
name: fix-bug
description: Standardized engineering procedure for fix bug
---

# Skill: fix-bug

## Purpose
Provides a deterministic, step-by-step workflow for executing fix bug in the Omnivra platform.

## Inputs
* Target files or PR link
* Relevant specification from `specs/`
* Acceptance criteria

## Preconditions
1. Working branch is clean (`git status`).
2. Dependencies are installed and typecheck passes.

## Procedure
1. **Analyze Context**: Review relevant ADRs and module boundaries.
2. **Execute Steps**: Perform changes in small, logical chunks.
3. **Verify Compliance**: Run `pnpm turbo run lint typecheck test`.
4. **Document Changes**: Update specs, ADRs, or READMEs as required.

## Definition of Done
* Code is fully typed and tested.
* Zero regressions introduced.
* Conventional Commit prepared.
