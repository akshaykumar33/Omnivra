# Dependency Management Policy

- Every third-party dependency must be reviewed for license compliance (Apache 2.0 / MIT compatible).
- Minimal bundle size footprint: tree-shakable ESM packages preferred.

---

## Audit exceptions

`pnpm audit` runs at `--audit-level=high` in CI and must stay green. An advisory
is only ever ignored when **all** of the following hold, and each exception is
recorded here with the reasoning:

1. No patched version exists.
2. The vulnerable package is reachable only through `devDependencies`, so it is
   never shipped to a user.
3. The exception is recorded in `pnpm.auditConfig.ignoreGhsas` so it is visible
   in review rather than hidden behind a lowered threshold.

Lowering `--audit-level` to silence a single advisory is not acceptable: it
disables every other high-severity finding at the same time.

### Current exceptions

| Advisory              | Package        | Why                                                                                                                                                                                                                                                                     |
| --------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GHSA-vfj7-8cjw-p6xm` | `braces@3.0.3` | Stack-exhaustion DoS via deeply nested patterns. `3.0.3` is the latest published version and the advisory lists no patched range, so there is nothing to upgrade to. Reached only through `@changesets/cli`, a devDependency used by release tooling, never at runtime. |

Re-check this table whenever `pnpm audit` changes: the moment a patched `braces`
ships, remove the entry and let the check enforce it again.
