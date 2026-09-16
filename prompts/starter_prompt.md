# MASTER PROJECT BOOTSTRAP PROMPT

You are acting as the founding Principal Engineer, Software Architect, Product Architect, UX Architect, DevOps Engineer, Security Engineer, AI Engineer, Computer-Vision Engineer, Developer-Experience Engineer, Technical Writer, and Open-Source Maintainer for this project.

Your job is NOT to immediately build the entire product.

Your first job is to create an exceptional, production-grade repository foundation containing architecture, specifications, documentation, engineering rules, AI-agent instructions, development skills, ADRs, design system specifications, testing strategy, Git workflow, milestone plans, phase plans, prompts, and implementation contracts.

Only after this foundation is complete may implementation begin phase by phase.

---

# 1. PROJECT VISION

Build a universal multimodal Human-Computer Interaction platform.

Core principle:

ANY INPUT → ANY LOGIC → ANY ACTION

Users should eventually be able to control:

* browsers
* websites
* VS Code / compatible IDEs
* desktop applications
* media
* developer tools
* supported operating-system actions

using:

* Voice
* Hand gestures
* Eye tracking
* Facial expressions
* Keyboard
* Mouse
* Controllers
* AI-generated commands
* Context-aware rules
* Combinations of multiple modalities

Examples:

"Whenever I blink twice, pause YouTube."

"When I raise two fingers, move to the next editor."

"When I say 'focus mode', close distracting tabs and open my coding workspace."

"On YouTube, palm-up means increase volume."

"When GitHub is open and I say 'review this', trigger my configured AI review workflow."

The system must remain extensible so future input engines and action providers can be installed without rewriting the core.

---

# 2. PRODUCT SURFACES

Architect the platform as an ecosystem rather than a single extension.

Applications:

apps/

* browser-extension
* vscode-extension
* desktop
* dashboard
* website
* playground

Core packages:

packages/

* core
* event-bus
* rule-engine
* action-engine
* plugin-sdk
* browser-sdk
* vscode-sdk
* desktop-sdk
* ai-engine
* voice-engine
* gesture-engine
* eye-engine
* face-engine
* context-engine
* storage
* sync
* telemetry
* security
* permissions
* config
* logger
* ui
* types
* utils
* cli

Official plugins:

plugins/

* youtube
* github
* spotify
* leetcode
* vscode
* browser
* obs
* discord
* figma

Examples:

examples/

* browser-plugin
* vscode-plugin
* custom-action
* custom-trigger
* multimodal-rule
* ai-generated-rule

---

# 3. TECHNOLOGY BASELINE

Evaluate before finalizing, but start from:

Language:

* TypeScript
* Node.js 24+
* ESM

Monorepo:

* pnpm workspaces
* Turborepo
* Changesets

Frontend:

* React 19
* Vite
* Tailwind CSS
* shadcn/ui
* Radix UI
* Zustand
* TanStack Query
* TanStack Table
* React Hook Form
* Zod
* Motion / Framer Motion
* Lucide

Browser:

* WXT
* Manifest V3
* WebExtension APIs
* WebExtension Polyfill

Desktop:

* Tauri v2
* Rust where native functionality/security/performance justifies it

VS Code:

* VS Code Extension API
* Webviews
* command contribution system

Computer Vision:

* MediaPipe
* ONNX Runtime Web
* TensorFlow.js where appropriate
* OpenCV where justified

Voice:

* Web Speech API
* Whisper
* optional local/offline engines

Backend:

* NestJS
* Fastify
* PostgreSQL
* Drizzle ORM
* Redis
* BullMQ
* WebSocket/SSE

AI:
Create a provider-independent abstraction supporting combinations of:

* OpenAI
* Anthropic
* Gemini
* Ollama
* LM Studio
* OpenRouter
* future providers

Do NOT tightly couple the architecture to one model vendor.

Testing:

* Vitest
* Playwright
* Testing Library
* MSW

Documentation:

* Fumadocs
* MDX
* Mermaid
* Storybook

DevOps:

* Docker
* GitHub Actions
* Changesets
* Renovate
* Husky
* Commitlint

Code Quality:

* ESLint
* Prettier
* Oxlint where beneficial
* Knip
* TypeScript strict mode

Evaluate newer/better alternatives before locking dependencies.

Document every significant technology decision through ADRs.

---

# 4. ARCHITECTURAL PRINCIPLES

Use:

* Clean Architecture
* SOLID
* Domain-driven boundaries where useful
* Event-driven architecture
* Adapter pattern
* Strategy pattern
* Plugin architecture
* Dependency inversion
* Dependency injection
* Strong typing
* Explicit contracts
* Schema validation
* Capability-based permissions

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

# 5. REPOSITORY FOUNDATION

Create a professional monorepo similar in discipline to major open-source frameworks.

Target:

/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   ├── dependabot.yml
│   └── workflows/
│
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
├── .gitignore
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

# 6. DOCUMENTATION ARCHITECTURE

Create useful Markdown documents rather than empty placeholders.

At minimum:

docs/
├── README.md
├── getting-started.md
├── product/
│   ├── vision.md
│   ├── prd.md
│   ├── personas.md
│   ├── use-cases.md
│   ├── user-stories.md
│   ├── feature-matrix.md
│   └── roadmap.md
│
├── engineering/
│   ├── engineering-principles.md
│   ├── coding-standards.md
│   ├── dependency-policy.md
│   ├── error-handling.md
│   ├── logging.md
│   ├── configuration.md
│   └── performance-budget.md
│
├── development/
│   ├── local-development.md
│   ├── testing.md
│   ├── debugging.md
│   ├── git-workflow.md
│   ├── pull-requests.md
│   └── releases.md
│
├── security/
│   ├── threat-model.md
│   ├── permissions.md
│   ├── privacy.md
│   ├── browser-security.md
│   ├── desktop-security.md
│   └── ai-security.md
│
├── accessibility/
│   ├── philosophy.md
│   ├── requirements.md
│   └── testing.md
│
└── api/

---

# 7. ARCHITECTURE DOCUMENTS

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

# 8. ADR SYSTEM

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

---

# 9. AI AGENT SYSTEM

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
└── code-reviewer.md

Each agent document must contain:

* Mission
* Responsibilities
* Scope
* Files owned
* Files it may modify
* Files it should avoid
* Required reading
* Coding rules
* Security rules
* Testing requirements
* Definition of Done
* Handoff procedure

---

# 10. AI SKILLS

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
├── write-tests/
├── create-package/
├── create-plugin/
├── create-adapter/
├── create-engine/
├── release-package/
├── update-docs/
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

# 11. AI CONTEXT SYSTEM

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

---

# 12. PROMPT LIBRARY

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
├── security-audit.md
├── performance-audit.md
├── accessibility-audit.md
├── documentation.md
├── release.md
└── dependency-upgrade.md

Prompts should be reusable with Codex, Claude Code, Gemini CLI, Cursor and other capable coding agents.

---

# 13. SPECIFICATION SYSTEM

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

# 14. DESIGN SYSTEM

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

* light
* dark
* system
* high contrast
* reduced motion

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

Use Storybook for reusable UI components.

---

# 15. GIT STRATEGY

Create docs/development/git-workflow.md.

Branches:

main
develop

Work through short-lived branches:

feat/*
fix/*
refactor/*
docs/*
test/*
perf/*
security/*
chore/*
release/*

Never directly implement substantial features on main.

Use Conventional Commits.

Examples:

feat(rule-engine): add compound trigger evaluation

fix(browser): prevent duplicate content-script registration

docs(architecture): document plugin lifecycle

refactor(core): extract event normalization pipeline

test(voice): add wake-word recognition coverage

perf(gesture): reduce inference allocations

security(desktop): validate native messaging origin

chore(deps): update workspace dependencies

---

# 16. COMMIT POLICY

Commits must be:

* atomic
* understandable
* reversible
* scoped
* tested

Do NOT produce commits such as:

"updates"

"changes"

"fix stuff"

"work"

"final"

Prefer:

feat(event-bus): implement typed event subscriptions

test(event-bus): cover listener cleanup

docs(event-bus): document subscription lifecycle

Each meaningful milestone should naturally produce multiple understandable commits rather than one massive commit.

---

# 17. PULL REQUEST SYSTEM

Create PR template requiring:

Summary
Problem
Solution
Architecture Impact
Screenshots
Testing
Performance Impact
Security Impact
Accessibility Impact
Documentation
Breaking Changes
Checklist

Require relevant tests before merge.

---

# 18. RELEASE STRATEGY

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

---

# 19. PHASE SYSTEM

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
Security Review
Performance Review
Accessibility Review
Documentation
Exit Criteria
Risks

---

# 20. MILESTONE SYSTEM

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

Improve this sequence based on dependency analysis.

Every milestone document MUST include:

Goal
Why
Dependencies
Architecture References
ADR References
Specifications
Tasks
Files to Create
Files to Modify
Files NOT to Modify
Acceptance Criteria
Unit Tests
Integration Tests
E2E Tests
Security Checks
Performance Checks
Accessibility Checks
Documentation Updates
Expected Commits
Definition of Done
Rollback Considerations

---

# 21. TESTING PYRAMID

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

# 22. SECURITY

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
secret management
CSP
dependency auditing

Never silently enable microphone/camera tracking.

Never transmit raw camera/microphone data to cloud services without explicit configuration and consent.

Document the threat model before implementing sensitive capabilities.

---

# 23. PRIVACY

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

---

# 24. PERFORMANCE

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

Recognition engines should support:

lazy loading
workers
sampling
throttling
adaptive inference frequency
model unloading
hardware acceleration where available

---

# 25. ACCESSIBILITY

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

# 26. AI RULE GENERATION

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

# 27. PLUGIN ARCHITECTURE

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

# 28. DEVELOPER EXPERIENCE

Target eventual workflows such as:

pnpm create omnicontrol-plugin

or:

omnicontrol plugin create

Developer should be able to create a plugin quickly.

Generate:

manifest
source
tests
README
example configuration

Create excellent documentation comparable in usability to high-quality modern developer platforms.

---

# 29. CI/CD

GitHub Actions pipelines should eventually include:

Install
Typecheck
Lint
Format validation
Unit tests
Integration tests
Build
Package boundary checks
Security scan
Dependency audit
E2E
Browser-extension build
VS Code extension build
Desktop build
Package validation
Changeset validation

Release pipelines should remain separate from PR validation.

---

# 30. DEPENDENCY BOUNDARIES

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

# 31. DOCUMENTATION-AS-CODE

Whenever behavior changes:

code
+
tests
+
specification
+
documentation

must remain synchronized.

Architecture-changing PRs require ADR updates.

Public API changes require documentation.

Breaking API changes require Changesets.

---

# 32. AI DEVELOPMENT PROTOCOL

When an AI coding agent receives a milestone:

STEP 1
Read repository instructions.

STEP 2
Read architecture.

STEP 3
Read applicable ADRs.

STEP 4
Read current phase.

STEP 5
Read current milestone.

STEP 6
Read relevant specs.

STEP 7
Read relevant SKILL.md.

STEP 8
Inspect existing implementation.

STEP 9
Produce a concise implementation plan.

STEP 10
Implement ONLY milestone scope.

STEP 11
Write/update tests.

STEP 12
Run validation.

STEP 13
Update documentation.

STEP 14
Produce suggested Conventional Commits.

STEP 15
Report:

Implemented
Tests
Validation
Files changed
Architecture impact
Security impact
Known limitations
Next milestone

Then STOP.

Do NOT automatically begin another milestone.

---

# 33. ANTI-AI-SLOP RULES

Never:

* generate hundreds of meaningless files
* create placeholder documents merely to satisfy a tree
* duplicate utilities
* create unnecessary abstractions
* use `any` unnecessarily
* suppress TypeScript errors
* disable lint rules to hide problems
* leave unexplained TODOs
* add dependencies without justification
* refactor unrelated code
* change architecture silently
* fake tests
* claim commands passed without running them
* implement speculative features
* expose secrets
* request excessive browser permissions

Prefer the smallest correct implementation consistent with the architecture.

---

# 34. README

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
Security
Privacy
Accessibility
Contributing
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

# 35. FIRST EXECUTION

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
12. Create phase plan.
13. Create 30–40 milestone plan.
14. Create Git strategy.
15. Create commit conventions.
16. Create PR workflow.
17. Create testing strategy.
18. Create security/privacy strategy.
19. Create performance budgets.
20. Create accessibility requirements.
21. Create release strategy.
22. Bootstrap only minimal monorepo/tooling required for this documentation foundation.
23. Validate links and document references.
24. Produce a repository-tree summary.
25. Produce the recommended next command/prompt for starting Milestone 00.

DO NOT implement Voice Engine.

DO NOT implement Gesture Engine.

DO NOT implement Eye Engine.

DO NOT implement browser automation.

DO NOT implement the VS Code extension.

DO NOT implement the desktop application.

DO NOT implement the cloud platform.

Those belong to later milestones.

---

# 36. FINAL OUTPUT OF FIRST EXECUTION

When finished, provide:

## Repository Foundation Created

### Architecture

What was created.

### Documentation

What was created.

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

### Git Strategy

Explain branch/commit/PR model.

### Validation

List commands actually executed and results.

### Open Decisions

List unresolved architectural decisions.

### Next Milestone

State exactly which milestone should begin next.

### Next AI Prompt

Give the exact prompt I should send to begin that milestone.

Do not start that milestone automatically.

---

# 37. QUALITY BAR

This repository should feel like the beginning of a serious open-source platform rather than an AI-generated demo.

Optimize for:

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
