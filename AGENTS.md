# Omnivra AI Agent Operational Protocol

All AI coding assistants (Cursor, Claude Code, Gemini CLI, Copilot, Codex) working on Omnivra MUST adhere to this canonical instruction protocol.

---

## 1. The Core Invariant

> **ANY INPUT → ANY LOGIC → ANY ACTION**

The core packages must remain host-agnostic. All hardware, browser, and OS bindings must pass through capability-checked adapters.

---

## 2. Order of Mandatory Reading before Generating Code

Before generating or modifying any code in this repository, you must read:

1. This root file (`AGENTS.md`)
2. [System Architecture](architecture/system-architecture.md) & [Component Architecture](architecture/component-architecture.md)
3. Applicable [ADRs](architecture/adr/README.md)
4. Current phase document in [phases/](phases/README.md)
5. Current milestone in [milestones/](milestones/README.md)
6. Relevant specification in [specs/](specs/README.md)
7. Applicable skill in [skills/](skills/README.md)

---

## 3. The Delivery Protocol (mandatory)

Every change — including yours — reaches `main` the same way:

> **branch → build → verify → secret-scan → commit → PR → green checks → review → merge**

There is no path to `main` that skips it. Concretely:

1. **Branch first**, before the first edit, from an up-to-date `main`:
   `git switch main && git pull --ff-only origin main && git switch -c <type>/<scope>-<description>`
2. Implement only the milestone scope.
3. Run validation and keep the **real** output. Never claim a command passed without running it.
4. **Self-review your diff for sensitive data** — credentials, tokens, endpoints, real user data, captured media, personal paths.
5. Commit in atomic [Conventional Commits](docs/development/git-workflow.md#3-commit-conventions). Let the hooks run; do not use `--no-verify`.
6. Push and open a pull request with the template completed, including screenshots for any UI change.
7. **Do not merge your own PR** without the approvals and green checks required by [merge-policy.md](docs/development/merge-policy.md).
8. Report what you did, then **stop**. Do not start the next milestone automatically.

Run the gate yourself at any time with `pnpm gate`.

Rules: [branching](docs/development/branching.md) ·
[protection gate](docs/development/commit-hooks.md) ·
[pull requests](docs/development/pull-requests.md) ·
[merge policy](docs/development/merge-policy.md) ·
[secrets](docs/security/secret-management.md)

---

## 4. The Two Non-Negotiables

Everything else is a strong recommendation. These are hard requirements — if a
tradeoff must be made, cut scope instead.

**UI/UX.** Every user-facing surface is designed, not assembled. Every state — empty,
loading, error, permission-denied, offline, first-run — is designed before it is
built. Keyboard-complete, WCAG 2.2 AA, light/dark/high-contrast, `prefers-reduced-motion`
honoured with a working non-animated equivalent, real copy, sub-100ms feedback. A UI
change without screenshots of every state in both themes is incomplete.

**Functionality.** Ship narrow and real, never broad and fake. No mocked UI presented
as working, no button wired to a `// TODO`, no hardcoded sample data in production
paths. Anything intentionally non-functional is visibly marked in the UI _and_ the
docs. Three flows that work flawlessly beat twelve that half-work.

**The stack is open.** Any library, framework, or service is fair game — including
ones newer than these instructions — if it produces a better product. Conditions:
evaluate an alternative, record an ADR, respect the performance budgets, and check
license and supply-chain health. Propose unrequested features that serve the vision;
do not silently build them into scope.

---

## 5. Anti-AI-Slop Rules

- Never generate placeholder or stub files without real implementation.
- Never ship UI that is not wired to real functionality.
- Never leave a state undesigned, or use lorem ipsum / "Something went wrong" as shipped copy.
- Never use `any` or suppress TypeScript diagnostics.
- Never bypass permission checks.
- Never stream raw webcam or microphone data outside the local process.
- Never commit directly to `main`, bypass hooks with `--no-verify`, or merge on red.
- Never expose secrets — see [secret-management.md](docs/security/secret-management.md).
- Always write unit tests for every logical branch.
