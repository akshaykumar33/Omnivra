# Contributing to Omnivra

Thank you for your interest in contributing to **Omnivra** — the Universal Multimodal Human-Computer Interaction Platform!

---

## 1. Code of Conduct
Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) in all community interactions.

---

## 2. Setup

```bash
git clone https://github.com/akshaykumar33/Omnivra.git
cd Omnivra
pnpm install          # installs dependencies AND activates the git hooks
```

The `prepare` script points git at `.githooks/`. Verify with
`git config --get core.hooksPath` (expect `.githooks`). If you have not installed
dependencies yet, activate the hooks directly with `node scripts/install-hooks.mjs`.

---

## 3. Development Workflow

Every change reaches `main` the same way, with no exceptions:

> **branch → build → verify → secret-scan → commit → PR → green checks → review → merge**

```bash
git switch main && git pull --ff-only origin main
git switch -c feat/rule-engine-compound-triggers
# work, committing atomically
pnpm gate                                    # secrets, paths, hygiene, branch name
git push -u origin feat/rule-engine-compound-triggers
gh pr create --draft --fill
```

1. **Branch naming** — `<type>/<scope>-<short-description>`, lowercase, hyphenated.
   Types: `feat`, `fix`, `refactor`, `docs`, `test`, `perf`, `security`, `chore`, `ci`,
   `build`, `release`, `revert`. Enforced by the `pre-push` hook and CI.
   → [branching.md](docs/development/branching.md)

2. **Conventional Commits** — enforced by the `commit-msg` hook.
   → [git-workflow.md](docs/development/git-workflow.md#3-commit-conventions)

3. **The protection gate** — hooks block credential files, secret content, focused
   tests, `debugger`, and oversized blobs *before* they enter history. CI re-runs every
   check, so `--no-verify` buys nothing.
   → [commit-hooks.md](docs/development/commit-hooks.md)

4. **Pull requests** — complete the template, include **screenshots of every affected
   state in light and dark** for any UI change, and paste the real output of your test
   run.
   → [pull-requests.md](docs/development/pull-requests.md)

5. **Merging** — squash merge, green checks, one approval, threads resolved. Never
   directly to `main`.
   → [merge-policy.md](docs/development/merge-policy.md)

---

## 4. The Two Non-Negotiables

**UI/UX** and **working functionality** are hard requirements. Every state is designed
(empty, loading, error, permission-denied, offline), everything is keyboard-complete
and WCAG 2.2 AA, and nothing visible in the UI is wired to a stub. If a tradeoff is
needed, cut scope — not quality.

**The stack is open.** Any library or framework is fair game if it makes the product
better: evaluate an alternative, record an ADR, respect the performance budgets, and
check license and supply-chain health.

---

## 5. Monorepo Architecture

Omnivra is organized as a pnpm monorepo managed by Turborepo:

* `packages/`: Core modules, event bus, rule engine, action engine, SDKs, and shared utilities.
* `apps/`: Target surfaces (Browser Extension, VS Code Extension, Desktop, Dashboard, Website).
* `plugins/`: Official and community integrations (YouTube, GitHub, Spotify, VS Code, OBS, etc.).
* `specs/`: Feature contracts and functional specifications.
* `architecture/`: System design documents and Architectural Decision Records (ADRs).

---

## 6. Anti-AI-Slop Rules

* Never commit dummy placeholder files or unverified stubs.
* Never ship UI that is not wired to real functionality, or leave a state undesigned.
* Never commit directly to `main`, bypass hooks with `--no-verify`, or merge on red.
* Avoid redundant utility duplication or gratuitous abstractions.
* Never use `any` or suppress TypeScript diagnostics without approved ADR justification.
* All external capabilities must declare capability-based permission boundaries.
