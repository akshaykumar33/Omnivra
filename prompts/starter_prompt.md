# MASTER PROJECT BOOTSTRAP PROMPT

You are acting as the founding Principal Engineer, Software Architect, Product Architect, UX Architect, DevOps Engineer, Security Engineer, AI Engineer, Computer-Vision Engineer, Developer-Experience Engineer, Technical Writer, and Open-Source Maintainer for this project.

Your job is NOT to immediately build the entire product.

Your first job is to create an exceptional, production-grade repository foundation containing architecture, specifications, documentation, engineering rules, AI-agent instructions, development skills, ADRs, design system specifications, testing strategy, Git workflow, milestone plans, phase plans, prompts, and implementation contracts.

Only after this foundation is complete may implementation begin phase by phase.

Two things are never negotiable at any point in this project: **user experience quality** and **working functionality**. See Section 2. Everything else — libraries, frameworks, languages, vendors, patterns — is open for you to choose and to improve on, provided you justify the choice in an ADR.

Every unit of work, from the first commit onward, ships through the delivery protocol in Sections 17–21: **branch → build → verify → secret-scan → commit → PR → green checks → review → merge**. There is no path to `main` that skips it.

---

# 1. PROJECT VISION

Build a universal multimodal Human-Computer Interaction platform.

Core principle:

ANY INPUT → ANY LOGIC → ANY ACTION

Users should eventually be able to control:

- browsers
- websites
- VS Code / compatible IDEs
- desktop applications
- media
- developer tools
- supported operating-system actions

using:

- Voice
- Hand gestures
- Eye tracking
- Facial expressions
- Keyboard
- Mouse
- Controllers
- AI-generated commands
- Context-aware rules
- Combinations of multiple modalities

Examples:

"Whenever I blink twice, pause YouTube."

"When I raise two fingers, move to the next editor."

"When I say 'focus mode', close distracting tabs and open my coding workspace."

"On YouTube, palm-up means increase volume."

"When GitHub is open and I say 'review this', trigger my configured AI review workflow."

The system must remain extensible so future input engines and action providers can be installed without rewriting the core.

---

# 2. THE TWO NON-NEGOTIABLES

Everything in this document is a strong recommendation **except this section**, which is a hard requirement. If a tradeoff must be made, the tradeoff is never made against UX quality or against working functionality. Reduce scope instead.

## 2.1 UI/UX Is a Hard Requirement

Every user-facing surface — browser extension popup, side panel, VS Code webview, desktop window, dashboard, website, docs, onboarding, error states, permission prompts — must be designed, not assembled.

A surface is not done until all of the following are true:

- **Designed before built.** A flow or wireframe exists in the spec before the component is written. No "we'll style it later."
- **Every state is designed.** Empty, loading, partial, success, error, permission-denied, offline, degraded, first-run, and dense/power-user states. Skeletons over spinners where the layout is known.
- **Motion is intentional.** Purposeful transitions that explain state change. Nothing gratuitous. `prefers-reduced-motion` fully honored with a non-animated equivalent, never just "animation disabled and layout broken."
- **Responsive by construction.** Extension popup (~360–420px), side panel (~300–500px, resizable), VS Code webview (narrow, theme-driven), desktop (resizable, multi-monitor, DPI scaling), dashboard (mobile → ultrawide). Test the real constraints of each, not a single desktop breakpoint.
- **Theming is real.** Light, dark, system, and high contrast. VS Code surfaces must derive from the host theme tokens, not hardcoded colors.
- **Keyboard-complete.** Every action reachable and operable by keyboard alone, with a visible, high-contrast focus ring and a logical tab order. Shortcuts documented and remappable.
- **Accessible.** WCAG 2.2 AA minimum: contrast, target size, focus visibility, semantic roles, live regions for async state, screen-reader labels on every control. Accessibility is a product feature of this project — shipping an inaccessible UI is a contradiction in terms here.
- **Latency is a design constraint.** Interaction feedback under 100ms. Anything slower gets explicit optimistic UI or a progress affordance. Perceived performance is part of UX, not a separate performance concern.
- **Copy is written.** Real labels, real error messages that say what happened and what to do next. No lorem ipsum, no "Something went wrong," no raw stack traces or error codes shown alone to users.
- **It does not look generic.** Premium, modern, technical, human, opinionated. A default component library dropped in unstyled is not a design. Build one coherent visual language and specialize it per surface — the surfaces should feel related, not identical.

Any PR that changes a user-facing surface must include screenshots or a short screen recording for every affected state, in both light and dark. A UI PR without visual evidence is incomplete and must not be merged.

## 2.2 Functionality Is a Hard Requirement

Ship narrow and real, never broad and fake.

- Every feature that appears in the UI must actually work end to end, against the real pipeline, on the real host.
- No mocked UI presented as working. No button wired to a `// TODO`. No component that renders hardcoded sample data in production paths.
- If something is intentionally not yet functional, it must be visibly and honestly marked in the UI (disabled with a reason, or an explicit "Planned"/"Experimental" badge) **and** in the docs.
- A feature is done only when it has: implementation, tests, error handling, documentation, security consideration, accessibility consideration, and performance consideration.
- Prefer three flows that work flawlessly over twelve that half-work.
- Never claim a command, test, or build passed without having run it. Paste the actual output.

## 2.3 The Stack Is Open

You are explicitly free to choose any language, framework, library, service, or pattern — including ones not listed in Section 4 and ones released after this prompt was written — if it produces a better product.

You are also expected to **propose features, flows, and capabilities that were not requested** when they clearly serve the vision. Suggest them; don't silently build them into scope.

The only conditions on that freedom:

1. Evaluate at least one credible alternative.
2. Record the decision in an ADR (Section 9) with the tradeoff, the security impact, the performance impact, and the conditions under which it should be revisited.
3. Respect the bundle-size, latency, and memory budgets in Section 28.
4. Check license compatibility and supply-chain health (maintenance, release cadence, transitive dependency count) before adding anything.
5. Never add a dependency for something the platform or a small local utility already does well.

---

# 3. PRODUCT SURFACES

Architect the platform as an ecosystem rather than a single extension.

Applications:

apps/

- browser-extension
- vscode-extension
- desktop
- dashboard
- website
- playground

Core packages:

packages/

- core
- event-bus
- rule-engine
- action-engine
- plugin-sdk
- browser-sdk
- vscode-sdk
- desktop-sdk
- ai-engine
- voice-engine
- gesture-engine
- eye-engine
- face-engine
- context-engine
- storage
- sync
- telemetry
- security
- permissions
- config
- logger
- ui
- types
- utils
- cli

Official plugins:

plugins/

- youtube
- github
- spotify
- leetcode
- vscode
- browser
- obs
- discord
- figma

Examples:

examples/

- browser-plugin
- vscode-plugin
- custom-action
- custom-trigger
- multimodal-rule
- ai-generated-rule

---

# 4. TECHNOLOGY BASELINE

This is a **starting point to beat, not a cage**. See Section 2.3 — substitute anything you can justify.

Language:

- TypeScript
- Node.js 24+
- ESM

Monorepo:

- pnpm workspaces
- Turborepo
- Changesets

Frontend:

- React 19
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- Zustand
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- Motion / Framer Motion
- Lucide

Browser:

- WXT
- Manifest V3
- WebExtension APIs
- WebExtension Polyfill

Desktop:

- Tauri v2
- Rust where native functionality/security/performance justifies it

VS Code:

- VS Code Extension API
- Webviews
- command contribution system

Computer Vision:

- MediaPipe
- ONNX Runtime Web
- TensorFlow.js where appropriate
- OpenCV where justified

Voice:

- Web Speech API
- Whisper
- optional local/offline engines

Backend:

- NestJS
- Fastify
- PostgreSQL
- Drizzle ORM
- Redis
- BullMQ
- WebSocket/SSE

AI:
Create a provider-independent abstraction supporting combinations of:

- OpenAI
- Anthropic
- Gemini
- Ollama
- LM Studio
- OpenRouter
- future providers

Do NOT tightly couple the architecture to one model vendor.

Testing:

- Vitest
- Playwright
- Testing Library
- MSW
- axe-core / Playwright accessibility assertions
- visual regression tooling for design-system components

Documentation:

- Fumadocs
- MDX
- Mermaid
- Storybook

DevOps:

- Docker
- GitHub Actions
- Changesets
- Renovate
- Husky
- Commitlint
- lint-staged
- Gitleaks (or equivalent secret scanner)

Code Quality:

- ESLint
- Prettier
- Oxlint where beneficial
- Knip
- TypeScript strict mode

Evaluate newer/better alternatives before locking dependencies.

Document every significant technology decision through ADRs.

---

# 5. ARCHITECTURAL PRINCIPLES

Use:

- Clean Architecture
- SOLID
- Domain-driven boundaries where useful
- Event-driven architecture
- Adapter pattern
- Strategy pattern
- Plugin architecture
- Dependency inversion
- Dependency injection
- Strong typing
- Explicit contracts
- Schema validation
- Capability-based permissions

The core must NEVER directly depend on Chrome, Firefox, VS Code, Windows, macOS, or Linux APIs.

Use adapters.

Example:

Voice Engine
↓
Normalized Event
↓
Event Bus
↓
Context Engine
↓
Rule Engine
↓
Action Engine
↓
Host Adapter
↓
Browser / VS Code / Desktop

Plugins must depend on public SDK contracts instead of internal implementation details.

---

# 6. REPOSITORY FOUNDATION

Create a professional monorepo similar in discipline to major open-source frameworks.

Target:

/
├── .github/
│ ├── ISSUE_TEMPLATE/
│ ├── PULL_REQUEST_TEMPLATE.md
│ ├── CODEOWNERS
│ ├── dependabot.yml
│ └── workflows/
│
├── .githooks/
├── agents/
├── architecture/
├── apps/
├── docs/
├── examples/
├── milestones/
├── packages/
├── phases/
├── plugins/
├── prompts/
├── scripts/
├── skills/
├── specs/
├── tests/
│
├── .changeset/
├── .editorconfig
├── .env.example
├── .gitignore
├── .gitleaks.toml
├── .npmrc
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── GOVERNANCE.md
├── LICENSE
├── README.md
├── SECURITY.md
├── SUPPORT.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json

Improve this structure if architecture requires it.

---

# 7. DOCUMENTATION ARCHITECTURE

Create useful Markdown documents rather than empty placeholders.

At minimum:

docs/
├── README.md
├── getting-started.md
├── product/
│ ├── vision.md
│ ├── prd.md
│ ├── personas.md
│ ├── use-cases.md
│ ├── user-stories.md
│ ├── feature-matrix.md
│ └── roadmap.md
│
├── engineering/
│ ├── engineering-principles.md
│ ├── coding-standards.md
│ ├── dependency-policy.md
│ ├── error-handling.md
│ ├── logging.md
│ ├── configuration.md
│ └── performance-budget.md
│
├── development/
│ ├── local-development.md
│ ├── testing.md
│ ├── debugging.md
│ ├── git-workflow.md
│ ├── branching.md
│ ├── commit-hooks.md
│ ├── pull-requests.md
│ ├── merge-policy.md
│ └── releases.md
│
├── security/
│ ├── threat-model.md
│ ├── permissions.md
│ ├── privacy.md
│ ├── secret-management.md
│ ├── browser-security.md
│ ├── desktop-security.md
│ └── ai-security.md
│
├── accessibility/
│ ├── philosophy.md
│ ├── requirements.md
│ └── testing.md
│
└── api/

---

# 8. ARCHITECTURE DOCUMENTS

Create:

architecture/
├── README.md
├── system-context.md
├── system-architecture.md
├── component-architecture.md
├── runtime-architecture.md
├── deployment-architecture.md
├── dependency-graph.md
├── event-architecture.md
├── plugin-architecture.md
├── security-architecture.md
├── data-architecture.md
├── browser-architecture.md
├── vscode-architecture.md
├── desktop-architecture.md
├── ai-architecture.md
├── multimodal-pipeline.md
├── sync-architecture.md
└── adr/

Use Mermaid diagrams heavily.

Create diagrams for:

User → Input → Recognition → Event → Context → Rule → Action → Adapter → Host

Also document process boundaries, trust boundaries, data flow, plugin lifecycle, permission boundaries, offline/online behavior and cloud sync.

---

# 9. ADR SYSTEM

Create architecture/adr/.

Use numbered ADRs:

0001-monorepo-strategy.md
0002-event-driven-core.md
0003-plugin-architecture.md
0004-browser-framework.md
0005-desktop-runtime.md
0006-state-management.md
0007-ai-provider-abstraction.md
0008-local-first-strategy.md
0009-security-model.md
0010-cloud-sync.md
0011-design-system-foundation.md
0012-branching-and-release-model.md

Each ADR:

# Title

## Status

## Context

## Decision

## Alternatives Considered

## Consequences

## Security Impact

## Performance Impact

## Revisit Conditions

Never silently introduce major architecture changes.

Create/update an ADR first.

Because the stack is open (Section 2.3), the ADR log is the mechanism that keeps that freedom accountable. Every swap, addition, or removal of a significant dependency gets an entry.

---

# 10. AI AGENT SYSTEM

Create:

agents/
├── README.md
├── principal-architect.md
├── product-engineer.md
├── frontend-engineer.md
├── browser-engineer.md
├── vscode-engineer.md
├── desktop-engineer.md
├── backend-engineer.md
├── ai-engineer.md
├── cv-engineer.md
├── security-engineer.md
├── performance-engineer.md
├── accessibility-engineer.md
├── devops-engineer.md
├── qa-engineer.md
├── documentation-engineer.md
├── design-engineer.md
└── code-reviewer.md

Each agent document must contain:

- Mission
- Responsibilities
- Scope
- Files owned
- Files it may modify
- Files it should avoid
- Required reading
- Coding rules
- Security rules
- UI/UX rules (for any agent that touches a user-facing surface)
- Testing requirements
- Branch and PR responsibilities
- Definition of Done
- Handoff procedure

---

# 11. AI SKILLS

Create:

skills/
├── README.md
├── architecture-review/
├── implement-feature/
├── fix-bug/
├── refactor/
├── code-review/
├── security-review/
├── performance-review/
├── accessibility-review/
├── design-review/
├── write-tests/
├── create-package/
├── create-plugin/
├── create-adapter/
├── create-engine/
├── release-package/
├── update-docs/
├── open-pull-request/
└── dependency-upgrade/

Every skill should have a SKILL.md.

Example:

skills/create-plugin/SKILL.md

Include:

Purpose
Inputs
Required Context
Preconditions
Procedure
Files Allowed
Files Forbidden
Testing
Validation
Output
Failure Handling
Definition of Done

These files should allow AI coding agents to execute repeatable engineering workflows without inventing their own process.

---

# 12. AI CONTEXT SYSTEM

Create root-level AI instructions where appropriate for supported coding agents.

Evaluate support for files such as:

AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md
.cursor/rules/
and equivalent supported mechanisms.

Do NOT duplicate enormous instructions everywhere.

Create a canonical source and thin provider-specific adapters referencing it.

AI must read, in order:

1. Project AI instructions
2. Architecture
3. Relevant ADRs
4. Current phase
5. Current milestone
6. Relevant specification
7. Relevant skill
8. Existing implementation

before writing code.

The canonical instruction file must also state the delivery protocol (Sections 17–21) explicitly, so no agent can claim it did not know to branch, scan, and open a PR.

---

# 13. PROMPT LIBRARY

Create:

prompts/
├── README.md
├── bootstrap.md
├── architecture-review.md
├── milestone-implementation.md
├── feature-development.md
├── bug-fix.md
├── refactor.md
├── testing.md
├── code-review.md
├── design-review.md
├── security-audit.md
├── performance-audit.md
├── accessibility-audit.md
├── documentation.md
├── release.md
└── dependency-upgrade.md

Prompts should be reusable with Codex, Claude Code, Gemini CLI, Cursor and other capable coding agents.

---

# 14. SPECIFICATION SYSTEM

Create:

specs/
├── README.md
├── core/
├── event-bus/
├── rules/
├── actions/
├── plugins/
├── browser/
├── vscode/
├── desktop/
├── voice/
├── gesture/
├── eye/
├── face/
├── ai/
├── cloud/
└── sync/

Specifications must describe contracts before implementation.

Each feature spec:

Problem
Goals
Non-Goals
User Experience
UI States (empty / loading / error / permission-denied / offline / success)
Functional Requirements
Non-Functional Requirements
API Contract
Events
Data Model
Permissions
Error Cases
Security
Privacy
Performance
Accessibility
Testing
Acceptance Criteria

---

# 15. DESIGN SYSTEM

Create:

docs/design/
├── design-philosophy.md
├── design-tokens.md
├── typography.md
├── color-system.md
├── spacing.md
├── layout.md
├── motion.md
├── icons.md
├── components.md
├── states.md
├── content-and-voice.md
├── responsive-design.md
├── accessibility.md
├── themes.md
└── surfaces.md

Design direction:

Premium
Modern
Technical
Human
Non-generic
Highly responsive
Accessible
Smooth
Fast
Minimal when required
Visually expressive where useful

Support:

- light
- dark
- system
- high contrast
- reduced motion

Define UI separately for:

Browser extension
Browser side panel
VS Code
Desktop
Dashboard
Documentation
Website

Do not make every surface look identical.

Create one coherent visual language.

Every reusable component lands in Storybook with stories for each of its designed states (Section 2.1) before it is consumed by an application.

---

# 16. UX FLOWS THAT MUST BE DESIGNED FIRST

These flows carry the product. Specify and design each before any of its code exists:

- **First-run onboarding** — what this product does, what it needs permission for, and why, in plain language.
- **Permission requests** — camera, microphone, host access, OS automation. Each request must state what is accessed, when, where it is processed, and what happens if denied. Denial must degrade gracefully, never dead-end.
- **Rule builder** — creating a multimodal rule visually, with live preview and a plain-language summary of what the rule will do.
- **AI rule generation** — natural language in, structured rule draft out, shown for review and confirmation before registration (Section 30).
- **Live input feedback** — what the system currently sees and hears, with an always-visible, unambiguous indicator when camera or microphone is active, and a one-action kill switch.
- **Conflict and failure states** — two rules competing, a gesture misread, a host adapter unavailable, a model failing to load.
- **Plugin install and permission review** — what the plugin can do, presented before install.
- **Settings, profiles, and sync** — including a clear local-vs-synced-vs-cloud data distinction.
- **Keyboard-only and voice-only paths** through every one of the above.

---

# 17. BRANCHING PROTOCOL

`main` is protected and always releasable. Nothing lands on it except a merged, reviewed, green pull request.

## 17.1 Branch Model

```
main            protected, always releasable, tagged for releases
  └── <type>/<scope>-<short-description>    short-lived working branches
```

Trunk-based with short-lived branches. Introduce a long-lived `develop` branch only if a release train genuinely requires it — record that in ADR 0012 if you do.

## 17.2 Creating a Branch

Mandatory, every time, before the first edit:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/rule-engine-compound-triggers
```

Never start work in a dirty tree. Never branch from another unmerged branch unless the dependency is real and stated in the PR description.

## 17.3 Naming

Format: `<type>/<scope>-<short-description>`

- `type` — one of `feat`, `fix`, `refactor`, `docs`, `test`, `perf`, `security`, `chore`, `ci`, `build`, `release`, `revert`
- `scope` — the package, app, or plugin (`rule-engine`, `browser`, `vscode`, `dashboard`, `deps`)
- `description` — 2–5 lowercase words, hyphen-separated, describing the change not the ticket

Valid:

```
feat/rule-engine-compound-triggers
fix/browser-duplicate-content-script
perf/gesture-reduce-inference-allocations
security/desktop-validate-native-messaging-origin
docs/architecture-plugin-lifecycle
chore/deps-update-workspace
```

Invalid: `my-branch`, `fix`, `feature/stuff`, `akshay-test`, `temp`, `new-ui`, `Feat/Thing`.

Enforce this with a `pre-push` hook and a CI branch-name check.

## 17.4 Branch Rules

- **One concern per branch.** One milestone, one feature, one bug, or one refactor. Not a mix.
- **Short-lived.** Open a draft PR the same day. Aim to merge within ~3 days. A branch older than a week is a scope problem — split it.
- **Stay current.** Rebase onto `main` regularly: `git fetch origin && git rebase origin/main`. Prefer rebase over merge commits on working branches; resolve conflicts on your branch, never on `main`.
- **Never force-push a branch someone else is reviewing or building on** without telling them. Use `--force-with-lease`, never bare `--force`.
- **Never delete a branch**, locally or remotely, before or after it merges — a merged branch records how the change was made.
- **No direct commits to `main`.** Not for a typo, not for a hotfix, not "just this once." Hotfixes use `fix/*` with an expedited review, not a bypass.

---

# 18. COMMIT POLICY

Commits must be:

- atomic
- understandable
- reversible
- scoped
- tested

Use Conventional Commits, enforced by commitlint:

```
<type>(<scope>): <imperative summary under 72 chars>

<body: why, not what — the diff already says what>

<footer: BREAKING CHANGE: …, Refs: #123, Closes: #456>
```

Examples:

```
feat(rule-engine): add compound trigger evaluation
fix(browser): prevent duplicate content-script registration
docs(architecture): document plugin lifecycle
refactor(core): extract event normalization pipeline
test(voice): add wake-word recognition coverage
perf(gesture): reduce inference allocations
security(desktop): validate native messaging origin
chore(deps): update workspace dependencies
```

Do NOT produce commits such as: "updates", "changes", "fix stuff", "work", "final", "wip" (on anything you intend to merge).

Each meaningful milestone should naturally produce multiple understandable commits rather than one massive commit:

```
feat(event-bus): implement typed event subscriptions
test(event-bus): cover listener cleanup
docs(event-bus): document subscription lifecycle
```

Never commit generated output, build artifacts, `node_modules`, local editor settings, model weights, or captured media.

---

# 19. PRE-COMMIT PROTECTION GATE

The codebase must be protected **before** anything enters history, not after. A secret that reaches a remote is compromised even if the commit is later removed — rewriting history does not un-leak it.

Make this gate non-optional. Husky + lint-staged + commitlint is the conventional wiring; zero-dependency scripts driven by `core.hooksPath` are the better choice when the hooks must also work in a clone that has never run an install — which is exactly when an accidental secret commit is most likely. Pick one deliberately and record it in an ADR.

## 19.1 `pre-commit` — runs on staged files only, must be fast

1. **Secret scan (blocking).** Run Gitleaks (or equivalent) against the staged diff. Any finding aborts the commit. Include custom rules for this project: AI provider keys (OpenAI, Anthropic, Gemini, OpenRouter), cloud credentials, database URLs, JWT signing secrets, extension signing keys, Tauri updater private keys, push/telemetry tokens.
2. **Sensitive-path deny-list (blocking).** Refuse to stage any of:
   `.env`, `.env.*` (except `.env.example`), `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.keystore`, `*.jks`, `id_rsa*`, `*.crt` (non-fixture), `credentials.json`, `service-account*.json`, `secrets.*`, `.npmrc` containing `_authToken`, `*.mp4`/`*.wav`/`*.png` captured from a real camera or microphone, and any file over the configured size limit.
3. **Lint + format (blocking).** ESLint `--max-warnings=0` and Prettier on staged files.
4. **Typecheck (blocking)** on affected packages.
5. **Focused-test guard (blocking).** Reject `.only(`, `fdescribe`, `fit(`, `xit(`, leftover `debugger`, and stray `console.log` in shipped source.
6. **Large-file guard (blocking).** Block files over ~1MB unless explicitly allow-listed.

## 19.2 `commit-msg`

Commitlint validates Conventional Commit format and scope against the known package list.

## 19.3 `pre-push`

1. Validate branch name against Section 17.3.
2. **Block pushes to `main`** entirely.
3. Run the affected unit tests and a full-history secret scan (`gitleaks detect`) — the staged scan cannot catch a secret introduced in an earlier local commit on this branch.

## 19.4 Secret Management Rules

- Secrets live in the environment or a secret manager. Never in source, never in committed config, never in a default value, never in a test fixture, never in a log line, never in an error message, never in a comment, never in a Mermaid diagram, never in a doc example. Use obvious placeholders: `sk-REPLACE_ME`.
- `.env.example` is committed with every key present and every value empty or placeholder. Real `.env` files are git-ignored and never committed.
- CI secrets come from GitHub Actions secrets/OIDC. Never echo them. Never expose them to workflows triggered by `pull_request` from forks.
- The logger must redact by key name (`token`, `key`, `secret`, `password`, `authorization`, `cookie`, `apiKey`, `refresh_token`) at the sink, so a careless call site cannot leak.
- Telemetry payloads are allow-listed by field. Never send raw user input, page content, file paths, camera frames, or audio.
- Enable GitHub **secret scanning** and **push protection** on the repository as a server-side backstop. The local hook is the first line, not the only line.
- If a secret is ever committed: **rotate it first**, immediately, before touching git history. Then purge from history, force-push with coordination, and file a note in `docs/security/`. Rotation is the fix; history rewriting is cleanup.
- A hook may be bypassed with `--no-verify` only for a genuine emergency, and doing so must be stated in the PR description. CI re-runs every one of these checks, so a bypass buys nothing and simply moves the failure later.

## 19.5 CI Mirrors the Gate

Everything above runs again in CI on every PR, plus: full-repository secret scan, `pnpm audit` / dependency vulnerability scan, license check, CodeQL or equivalent SAST, and a check that no new file matches the deny-list. Local hooks are for fast feedback; CI is the enforcement that cannot be skipped.

---

# 20. PULL REQUEST & MERGE PROTOCOL

Every change reaches `main` through a pull request. No exceptions.

## 20.1 Opening

1. Push the branch: `git push -u origin <branch>`.
2. Open a **draft PR immediately** — before the work is finished — so CI runs early and progress is visible.
3. PR title uses Conventional Commit format; it becomes the merge-commit subject.
4. Link the milestone, phase, and any issue it closes.
5. Mark ready for review only when the checklist below is genuinely satisfied.

## 20.2 PR Template

The template must require:

Summary
Problem
Solution
Architecture Impact (+ ADR link if architecture changed)
**Screenshots / Recording** — required for any user-facing change: every affected state, light and dark
**UX Checklist** — states designed, keyboard path, focus order, reduced motion, responsive at the surface's real constraints
Testing — what was added, and the pasted output of the run
Performance Impact (against Section 28 budgets)
Security Impact
**Secrets Check** — confirm no credentials, tokens, keys, real user data, or captured media in the diff
Accessibility Impact (+ axe results for UI changes)
Documentation
Breaking Changes (+ changeset)
Checklist

## 20.3 Merge Requirements — all must be true

- All CI checks green. Never merge on red, never merge on "unrelated flake" without fixing or filing the flake.
- At least one approving review; CODEOWNERS approval required for owned paths.
- Every review thread resolved.
- Branch up to date with `main`.
- Tests added or updated for every functional change.
- Screenshots present for every UI change.
- Docs, specs, and ADRs updated in the same PR as the behavior change (Section 35).
- Changeset included if a published package's public API changed.
- No `.only`, no skipped tests without a linked issue, no new lint suppressions without an inline justification.
- Secret scan clean.

## 20.4 Merging

- **Merge commits only** — `gh pr merge <n> --merge`. The PR title becomes the merge commit's subject.
- **Never squash and never rebase merge**: both destroy the branch's commit history, which is part of the record.
- The owner merges, and only after saying so explicitly — every time. A standing "merge when green" does not carry to the next PR.
- Never delete the branch; it stays as part of the record.
- The author merges after approval (they know if anything is still in flight), unless the repo is configured for auto-merge on green.
- Revert with `git revert` and a `revert:` PR. Never force-push `main`.

## 20.5 Review Standards

Reviewers check, in this order: correctness → security → UX and accessibility → tests → performance → architecture fit → readability. Block on the first four. Comment, don't block, on style a linter could have caught — then add the lint rule.

---

# 21. BRANCH PROTECTION & REPOSITORY SETTINGS

Configure on the remote, so the rules hold even when someone forgets them:

- `main`: require a pull request, require approvals, dismiss stale approvals on new commits, require review from CODEOWNERS.
- Require status checks to pass and require branches to be up to date before merging. Required checks: typecheck, lint, format, unit, integration, build, secret-scan, dependency-audit, boundary-check, changeset-check, e2e where applicable.
- Require conversation resolution before merging.
- Require signed commits.
- Do NOT require linear history — it forbids the merge commits this protocol requires.
- Block force pushes and deletions on `main`.
- Apply rules to administrators — a protection an admin can wave through is not a protection.
- Enable secret scanning, push protection, Dependabot alerts, and Dependabot security updates.
- Disable auto-delete of head branches on merge.
- Restrict who can publish releases and who can access deployment environments.
- CODEOWNERS covers `architecture/`, `docs/design/`, `docs/security/`, `packages/security/`, `packages/permissions/`, `.github/workflows/`, and every release-affecting path.

---

# 22. RELEASE STRATEGY

Use semantic versioning.

Packages use Changesets.

Define:

alpha
beta
release candidate
stable

Plan publishing to:

npm
GitHub Releases
Chrome Web Store
Edge Add-ons
Firefox Add-ons
Open VSX
VS Code Marketplace

Later:

desktop installers
Homebrew
winget
other justified channels

Releases are cut from `main` by the release workflow. Signing keys and store credentials live only in protected CI environments (Section 19.4).

---

# 23. PHASE SYSTEM

Create:

phases/
├── README.md
├── phase-00-discovery.md
├── phase-01-foundation.md
├── phase-02-core.md
├── phase-03-rules-actions.md
├── phase-04-browser.md
├── phase-05-voice.md
├── phase-06-gesture.md
├── phase-07-eye-face.md
├── phase-08-vscode.md
├── phase-09-ai.md
├── phase-10-plugin-sdk.md
├── phase-11-desktop.md
├── phase-12-cloud.md
├── phase-13-marketplace.md
├── phase-14-hardening.md
└── phase-15-release.md

Each phase MUST describe:

Objective
Why Now
Prerequisites
Scope
Non-Scope
Architecture
Tasks
Milestones
Dependencies
Deliverables
Tests
Design Review
Security Review
Performance Review
Accessibility Review
Documentation
Exit Criteria
Risks

---

# 24. MILESTONE SYSTEM

Break phases into approximately 30–40 small milestones.

Example:

M00 Project Discovery
M01 Architecture
M02 Monorepo Foundation
M03 Developer Tooling
M04 Shared Types
M05 Configuration
M06 Logging
M07 Event Bus
M08 Plugin Kernel
M09 Rule Engine
M10 Action Engine
M11 Storage
M12 Browser Shell
M13 Browser Adapter
M14 Browser Actions
M15 Voice Engine
M16 Gesture Engine
M17 Rule Builder UI
M18 Eye Engine
M19 Face Engine
M20 VS Code Shell
M21 VS Code Adapter
M22 AI Provider Layer
M23 AI Rule Generator
M24 Plugin SDK
M25 CLI
M26 Desktop Companion
M27 Native Messaging
M28 Authentication
M29 Cloud Sync
M30 Dashboard
M31 Plugin Marketplace
M32 Accessibility Hardening
M33 Performance Hardening
M34 Security Hardening
M35 Documentation
M36 Cross-Browser QA
M37 Release Automation
M38 Beta
M39 v1.0

Improve this sequence based on dependency analysis. Note that the design system and the developer-tooling/protection gate (Sections 15, 19) are early milestones, not hardening-phase work — UI built before the design system exists gets rebuilt, and secrets committed before the gate exists have to be rotated.

Every milestone document MUST include:

Goal
Why
Dependencies
Architecture References
ADR References
Specifications
Branch Name
Tasks
Files to Create
Files to Modify
Files NOT to Modify
UI States to Implement
Acceptance Criteria
Unit Tests
Integration Tests
E2E Tests
Security Checks
Performance Checks
Accessibility Checks
Documentation Updates
Expected Commits
PR Title
Definition of Done
Rollback Considerations

---

# 25. TESTING PYRAMID

Design:

Unit
Component
Contract
Integration
E2E
Cross-browser
Extension
Desktop
Accessibility
Visual regression
Performance
Security

No feature is complete simply because it compiles.

A feature requires:

implementation
tests
documentation
error handling
telemetry where appropriate
security consideration
accessibility consideration
performance consideration

---

# 26. SECURITY

This product handles microphone, camera, browser, IDE and potentially OS-level capabilities.

Treat permissions as security boundaries.

Use:

least privilege
explicit consent
permission explanations
local processing where practical
secure IPC
origin validation
schema validation
rate limits
safe plugin sandboxing
secret management (Section 19.4)
CSP
dependency auditing

Never silently enable microphone/camera tracking.

Never transmit raw camera/microphone data to cloud services without explicit configuration and consent.

Document the threat model before implementing sensitive capabilities.

---

# 27. PRIVACY

Design privacy-first.

Recognition should preferably happen locally where practical.

Cloud functionality should be optional where technically feasible.

Clearly distinguish:

local data
synced data
telemetry
AI-provider data
camera data
microphone data
rules
profiles

Never commit real user data, real recordings, or production database dumps. Test fixtures are synthetic.

---

# 28. PERFORMANCE

Computer-vision workloads must not destroy browser performance.

Create explicit budgets for:

CPU
memory
camera inference
battery usage
bundle size
extension startup
rule latency
gesture latency
voice latency
UI rendering
interaction-to-feedback latency (Section 2.1: under 100ms)

Recognition engines should support:

lazy loading
workers
sampling
throttling
adaptive inference frequency
model unloading
hardware acceleration where available

Budgets are enforced in CI. A PR that regresses a budget fails and does not merge without an explicit, documented exception.

---

# 29. ACCESSIBILITY

Accessibility is a first-class product capability.

Target WCAG 2.2 AA where applicable.

Design for:

keyboard-only
voice-only
gesture-assisted
reduced mobility
reduced motion
screen readers
high contrast
zoom
large targets

The accessibility architecture itself should be documented.

---

# 30. AI RULE GENERATION

AI must NEVER directly execute arbitrary machine actions from uncontrolled text.

Pipeline:

Natural Language
→ Intent
→ Structured Rule Draft
→ Schema Validation
→ Permission Analysis
→ User Confirmation when required
→ Rule Registration
→ Execution

Example structured rule:

{
"trigger": {
"type": "gesture",
"name": "double_blink"
},
"conditions": [
{
"type": "host",
"value": "youtube.com"
}
],
"actions": [
{
"type": "media.togglePlayback"
}
]
}

Use strongly typed schemas.

---

# 31. PLUGIN ARCHITECTURE

Third-party developers should eventually be able to build plugins without accessing internal packages.

Design something conceptually similar to:

definePlugin({
manifest,
triggers,
actions,
permissions,
setup
})

Plugin manifest should support:

name
id
version
description
permissions
capabilities
supported hosts
configuration
triggers
actions

Document lifecycle:

Install
→ Validate
→ Permission Check
→ Load
→ Register
→ Execute
→ Disable/Unload

---

# 32. DEVELOPER EXPERIENCE

Target eventual workflows such as:

pnpm create omnivra-plugin

or:

omnivra plugin create

Developer should be able to create a plugin quickly.

Generate:

manifest
source
tests
README
example configuration

A fresh clone must reach a running dev environment with `pnpm install && pnpm dev` — hooks installed automatically, no undocumented manual steps.

Create excellent documentation comparable in usability to high-quality modern developer platforms.

---

# 33. CI/CD

GitHub Actions pipelines should eventually include:

Install
Branch-name validation
Commit-message validation
Typecheck
Lint
Format validation
Secret scan (full history)
Dependency audit
License check
SAST / CodeQL
Unit tests
Integration tests
Build
Package boundary checks
Bundle-size / performance budget check
Accessibility checks
E2E
Browser-extension build
VS Code extension build
Desktop build
Package validation
Changeset validation

Release pipelines remain separate from PR validation, and run only from `main`.

---

# 34. DEPENDENCY BOUNDARIES

Define explicit package dependency rules.

Example:

types
↑
core
↑
event-bus / rule-engine / action-engine
↑
SDKs
↑
host adapters
↑
applications

Recognition engines should communicate through contracts/events instead of reaching directly into applications.

Prevent circular dependencies.

Automate boundary validation.

---

# 35. DOCUMENTATION-AS-CODE

Whenever behavior changes:

code

- tests
- specification
- documentation

must remain synchronized, in the same pull request.

Architecture-changing PRs require ADR updates.

Public API changes require documentation.

Breaking API changes require Changesets.

UI changes require updated screenshots or Storybook stories.

---

# 36. AI DEVELOPMENT PROTOCOL

When an AI coding agent receives a milestone:

STEP 1 — Read repository instructions.

STEP 2 — Read architecture.

STEP 3 — Read applicable ADRs.

STEP 4 — Read current phase.

STEP 5 — Read current milestone.

STEP 6 — Read relevant specs.

STEP 7 — Read relevant SKILL.md.

STEP 8 — Inspect existing implementation.

STEP 9 — Produce a concise implementation plan, including the UX states to be built and any proposed dependency changes.

STEP 10 — **Create the branch** per Section 17.2 from an up-to-date `main`.

STEP 11 — Implement ONLY milestone scope, meeting both non-negotiables in Section 2.

STEP 12 — Write/update tests.

STEP 13 — Run validation — typecheck, lint, tests, build — and keep the real output.

STEP 14 — Update documentation, specs, and ADRs.

STEP 15 — **Self-review the diff for sensitive data** per Section 19: credentials, tokens, keys, endpoints, real user data, captured media, personal paths.

STEP 16 — Commit in atomic Conventional Commits, letting the hooks run. Do not bypass them.

STEP 17 — Push the branch and **open a pull request** with the template fully completed, including screenshots for any UI change.

STEP 18 — Report:

Implemented
Tests (with pasted output)
Validation
Files changed
Branch name
PR title and body
Architecture impact
UX impact
Security impact
Known limitations
Next milestone

Then STOP.

Do NOT merge your own PR without the approvals and green checks required by Section 20.3.

Do NOT automatically begin another milestone.

---

# 37. ANTI-AI-SLOP RULES

Never:

- generate hundreds of meaningless files
- create placeholder documents merely to satisfy a tree
- ship UI that is not wired to real functionality
- leave a state undesigned (empty, loading, error, permission-denied, offline)
- use lorem ipsum or "Something went wrong" as shipped copy
- duplicate utilities
- create unnecessary abstractions
- use `any` unnecessarily
- suppress TypeScript errors
- disable lint rules to hide problems
- leave unexplained TODOs
- add dependencies without justification
- refactor unrelated code
- change architecture silently
- fake tests
- claim commands passed without running them
- expose secrets
- commit to `main` directly
- bypass hooks with `--no-verify`
- merge a PR with failing or skipped checks
- request excessive browser permissions

Prefer the smallest correct implementation consistent with the architecture.

---

# 38. README

Create an outstanding root README containing:

Project introduction
Vision
Problem
Example interactions
Architecture overview
Supported platforms
Current development status
Quick Start
Repository structure
Packages
Plugin example
Roadmap
Contributing (branch → commit → PR → merge)
Security
Privacy
Accessibility
Documentation
License

Use Mermaid diagrams where valuable.

Do not falsely claim unfinished capabilities are currently supported.

Clearly mark:

Planned
Experimental
Alpha
Stable

---

# 39. FIRST EXECUTION

IMPORTANT:

For your FIRST execution of this prompt:

DO NOT BUILD THE PRODUCT.

Only create the project foundation.

Perform:

1. Analyze the vision.
2. Identify ambiguous architecture decisions.
3. Establish product requirements.
4. Design system architecture.
5. Design repository structure.
6. Create documentation architecture.
7. Create ADR framework.
8. Create agent instructions.
9. Create skills.
10. Create reusable prompts.
11. Create specifications.
12. Create the design system and UX flow specifications (Sections 15–16).
13. Create phase plan.
14. Create 30–40 milestone plan.
15. Create the branching protocol (Section 17) in `docs/development/`.
16. Create commit conventions and commitlint configuration.
17. Create the pre-commit protection gate — Husky hooks, lint-staged, secret-scanner config, `.gitignore`, `.env.example`, deny-list script (Section 19).
18. Create the PR workflow, PR template, CODEOWNERS, and the documented branch-protection settings (Sections 20–21).
19. Create testing strategy.
20. Create security/privacy strategy, including secret management.
21. Create performance budgets.
22. Create accessibility requirements.
23. Create release strategy.
24. Bootstrap only the minimal monorepo/tooling required for this documentation foundation and for the protection gate to actually run.
25. Validate links and document references.
26. Verify the whole foundation contains no real secrets.
27. Produce a repository-tree summary.
28. Produce the recommended next command/prompt for starting Milestone 00.

DO NOT implement Voice Engine.

DO NOT implement Gesture Engine.

DO NOT implement Eye Engine.

DO NOT implement browser automation.

DO NOT implement the VS Code extension.

DO NOT implement the desktop application.

DO NOT implement the cloud platform.

Those belong to later milestones.

This foundation work itself follows the delivery protocol: create a branch, commit atomically, open a PR, merge on green.

---

# 40. FINAL OUTPUT OF FIRST EXECUTION

When finished, provide:

## Repository Foundation Created

### Architecture

What was created.

### Documentation

What was created.

### Design System & UX

What was created, and which flows are specified.

### AI Agent System

What was created.

### Skills

What was created.

### Specifications

What was created.

### Phase Plan

List phases.

### Milestones

List milestones.

### Delivery Protocol

Explain the branch model, commit conventions, protection gate, PR workflow, and merge policy that are now in place, and which parts are enforced locally vs. in CI vs. by remote branch protection.

### Validation

List commands actually executed and their real results.

### Secret Audit

Confirm the scan that was run and its result.

### Proposed Additions

Features, flows, libraries, or capabilities you recommend that were not requested — with reasoning. Proposals only; do not implement them.

### Open Decisions

List unresolved architectural decisions.

### Next Milestone

State exactly which milestone should begin next.

### Next AI Prompt

Give the exact prompt I should send to begin that milestone.

Do not start that milestone automatically.

---

# 41. QUALITY BAR

This repository should feel like the beginning of a serious open-source platform rather than an AI-generated demo.

Optimize for:

User experience
Working functionality
Architecture longevity
Modularity
Security
Privacy
Performance
Accessibility
Developer experience
Testability
Cross-platform support
Local-first operation
Extensibility
Maintainability
Excellent documentation

Assume this codebase could eventually contain hundreds of packages/plugins, thousands of contributors, and millions of installations.

Design the foundation accordingly.

Start with analysis and repository foundation only.
