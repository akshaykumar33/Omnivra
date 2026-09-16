# Contributing to Omnivra

Thank you for your interest in contributing to **Omnivra** — the Universal Multimodal Human-Computer Interaction Platform!

---

## 1. Code of Conduct
Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) in all community interactions.

---

## 2. Development Workflow

We follow a strict, disciplined Git and PR workflow:

1. **Branch Naming**:
   * `feat/<scope>-<description>` (e.g. `feat/rule-engine-compound-triggers`)
   * `fix/<scope>-<description>` (e.g. `fix/browser-event-dedup`)
   * `docs/<description>` (e.g. `docs/multimodal-pipeline`)
   * `refactor/<scope>-<description>`
   * `test/<scope>-<description>`

2. **Conventional Commits**:
   All commit messages must adhere to the Conventional Commits specification:
   ```
   <type>(<scope>): <short description>

   [optional body]

   [optional footer(s)]
   ```
   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

3. **Pull Request Protocol**:
   * Fill out the complete PR template.
   * Provide unit tests for every logical change.
   * Ensure typechecking, linting, and tests pass:
     ```bash
     pnpm turbo run build lint typecheck test
     ```
   * Link all relevant issues or specifications.

---

## 3. Monorepo Architecture

Omnivra is organized as a pnpm monorepo managed by Turborepo:

* `packages/`: Core modules, event bus, rule engine, action engine, SDKs, and shared utilities.
* `apps/`: Target surfaces (Browser Extension, VS Code Extension, Desktop, Dashboard, Website).
* `plugins/`: Official and community integrations (YouTube, GitHub, Spotify, VS Code, OBS, etc.).
* `specs/`: Feature contracts and functional specifications.
* `architecture/`: System design documents and Architectural Decision Records (ADRs).

---

## 4. Anti-AI-Slop Rules

* Never commit dummy placeholder files or unverified stubs.
* Avoid redundant utility duplication or gratuitous abstractions.
* Never use `any` or suppress TypeScript diagnostics without approved ADR justification.
* All external capabilities must declare capability-based permission boundaries.
